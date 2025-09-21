import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/model/user";
import cloudinary from "@/lib/cloudinary";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

await dbConnect();

type IUser = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "admin" | "user" | "barber";
  status?: "active" | "inactive";
  avatar?: { url: string; public_id: string };
  image?: string;
  [key: string]: unknown; // replace any with unknown
};

// Cloudinary upload response type
type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const query: Partial<IUser> = {};
    if (role) query.role = role as IUser["role"];
    if (status) query.status = status as IUser["status"];

    const users = await UserModel.find(query);
    return NextResponse.json(users, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Partial<IUser> & { avatar?: string; image?: string; password?: string } =
      await request.json();
    const { avatar, image, ...rest } = body;

    // Check if email already exists
    if (rest.email) {
      const existingUser = await UserModel.findOne({ email: rest.email });
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Validate password if provided
    if (rest.password && rest.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    let avatarData: IUser["avatar"] | undefined = undefined;

    // Handle image upload - check both avatar and image fields
    const imageToUpload = avatar || image;
    if (imageToUpload) {
      const uploadRes: CloudinaryUploadResponse =
        await cloudinary.uploader.upload(imageToUpload, { folder: "users" });
      avatarData = {
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      };
    }

    // Create user with proper field mapping
    // Remove _id from rest if it's empty string to let MongoDB auto-generate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...userFields } = rest;
    const userData = {
      ...userFields,
      avatar: avatarData,
      image: avatarData?.url || image || "", // Store image URL in image field as well
    };

    console.log("Creating user with data:", { ...userData, password: userData.password ? "[REDACTED]" : "not provided" });

    const user = new UserModel(userData);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    // Emit socket event for user creation
    if (global.io) {
      global.io.emit("user:update", userObj);
    }

    return NextResponse.json(userObj, { status: 201 });
  } catch (error: unknown) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
