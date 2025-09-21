import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/model/user";
import cloudinary from "@/lib/cloudinary";

// Declare global io for TypeScript
declare global {
  var io: import("socket.io").Server;
}

await dbConnect();

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

type UpdateUserPayload = Partial<{
  name: string;
  email: string;
  phone: string;
  password: string;
  ageGroup: string;
  customerType: string;
  avatar: string;
  image: string;
  position: string;
  experience: number;
  status: string;
  [key: string]: unknown;
}>;

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}

// PATCH update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateUserPayload = await request.json();
    
    console.log("User update request:", { id, body });
    
    const { avatar, image, password, ...rest } = body; // extract password separately

    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email already exists for another user
    if (rest.email && rest.email !== user.email) {
      const existingUser = await UserModel.findOne({ 
        email: rest.email, 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Handle avatar/image upload - check both avatar and image fields
    const imageToUpload = avatar || image;
    if (imageToUpload) {
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
      const uploadRes = await cloudinary.uploader.upload(imageToUpload, {
        folder: "users",
      });
      user.avatar = {
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      };
      // Also update the image field for compatibility
      user.image = uploadRes.secure_url;
    }

    // Update other fields
    Object.assign(user, rest);

    // Update password only if it's provided and non-empty
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      user.password = password; // pre-save hook in Mongoose will hash it
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    // Emit socket event for user update
    if (global.io) {
      global.io.emit("user:update", userObj);
    }

    return NextResponse.json(userObj, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}


// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Emit socket event for user deletion
    if (global.io) {
      global.io.emit("user:deleted", { id, user: deletedUser });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
