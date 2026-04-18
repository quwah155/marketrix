import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import { Role } from "@/types/db";
import { clientPromise } from "@/lib/mongodb";
import { connectToDatabase } from "@/lib/mongoose";
import { UserModel } from "@/server/models";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";

type AuthDbUser = {
  _id: Types.ObjectId;
  id?: string;
  name?: string | null;
  email: string;
  image?: string | null;
  passwordHash?: string | null;
  emailVerified?: Date | null;
  role?: Role | null;
};

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: Role.BUYER,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectToDatabase();
        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase(),
        }).lean<AuthDbUser | null>();

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        const smtpConfigured =
          !!(process.env.SMTP_URL || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
        if (!user.emailVerified && smtpConfigured) {
          throw new Error("Please verify your email before signing in");
        }

        return {
          id: user._id.toString(),
          name: user.name ?? null,
          email: user.email,
          image: user.image ?? null,
          role: user.role ?? Role.BUYER,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.role = session.role;
      }

      // Always fetch fresh role from DB (for role changes)
      if (token.id) {
        await connectToDatabase();
        const dbUser = await UserModel.findById(token.id as string)
          .select({ role: 1, name: 1, image: 1 })
          .lean<AuthDbUser | null>();
        if (dbUser) {
          token.role = dbUser.role ?? Role.BUYER;
          token.name = dbUser.name;
          token.picture = dbUser.image ?? undefined;
          if (!dbUser.role) {
            await UserModel.findByIdAndUpdate(token.id as string, {
              role: Role.BUYER,
            });
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ account }) {
      // Allow Google sign-ins without email verification check
      if (account?.provider === "google") {
        return true;
      }
      return true; // credentials authorize() already handles the check
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create vendor profile if role is VENDOR
      await connectToDatabase();
      const dbUser = await UserModel.findById(
        user.id,
      ).lean<AuthDbUser | null>();
      const role = dbUser?.role ?? Role.BUYER;
      if (!dbUser?.role) {
        await UserModel.findByIdAndUpdate(user.id, { role: Role.BUYER });
      }
      if (role === Role.VENDOR) {
        await vendorProfileRepository.createForUser(
          (dbUser?._id ?? dbUser?.id ?? user.id).toString(),
        );
      }
    },
  },
};
