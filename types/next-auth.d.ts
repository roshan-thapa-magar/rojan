import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
      oauthProvider?: string;
      lastLoginAt?: Date;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    status: string;
    oauthProvider?: string;
    lastLoginAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
    oauthProvider?: string;
    lastLoginAt?: Date;
  }
}
