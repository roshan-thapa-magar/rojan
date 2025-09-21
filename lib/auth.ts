import NextAuth, { NextAuthOptions, Account, Profile, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import UserModel from "@/model/user";
import { dbConnect } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect(); // make sure MongoDB is connected

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await UserModel.findOne({
          email: credentials.email,
        }).select("+password");
        if (!user) throw new Error("No user found with this email");

        // Check if user has a password (not OAuth user)
        if (!user.password) {
          throw new Error("Please sign in with Google or reset your password");
        }

        // Compare passwords
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Incorrect password");

        // Return user object (omit password)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null; profile?: Profile }) {
      try {
        await dbConnect();

        if (account?.provider === "google") {
          // Validate Google profile data
          if (!user.email || !user.name) {
            console.error("Missing required Google profile data");
            return false;
          }

          // Check if user exists in database
          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = new UserModel({
              name: user.name,
              email: user.email,
              image: user.image || "",
              role: "user",
              status: "active",
              // Store OAuth provider info
              oauthProvider: "google",
              oauthId: account.providerAccountId,
              lastLoginAt: new Date(),
            });

            await newUser.save();
            console.log("New Google OAuth user created:", newUser.email);
          } else {
            // Update existing user's OAuth info and last login
            await UserModel.findByIdAndUpdate(existingUser._id, {
              image: user.image || existingUser.image,
              oauthProvider: "google",
              oauthId: account.providerAccountId,
              lastLoginAt: new Date(),
            });
            console.log("Existing user logged in via Google:", existingUser.email);
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
      try {
        if (user) {
          await dbConnect();
          
          const dbUser = await UserModel.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.oauthProvider = account?.provider;
            token.lastLoginAt = new Date();
          }
        }

        // Refresh user data periodically
        if (token.id && token.lastLoginAt && Date.now() - new Date(token.lastLoginAt).getTime() > 24 * 60 * 60 * 1000) {
          await dbConnect();
          const dbUser = await UserModel.findById(token.id);
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.lastLoginAt = new Date();
          }
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        if (token) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.status = token.status;
          session.user.oauthProvider = token.oauthProvider;
          session.user.lastLoginAt = token.lastLoginAt;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If URL is provided and valid, use it
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      
      // Redirect to callback page for role-based redirection
      return `${baseUrl}/auth/callback`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
