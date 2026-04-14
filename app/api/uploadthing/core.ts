import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Product file uploads (vendors only)
  productFile: f({
    pdf: { maxFileSize: "128MB" },
    "application/zip": { maxFileSize: "128MB" },
    video: { maxFileSize: "128MB" },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new Error("Unauthorized");
      if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
        throw new Error("Only vendors can upload product files");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Product file uploaded by:", metadata.userId);
      return { url: file.url, key: file.key };
    }),

  // Thumbnail images
  productThumbnail: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new Error("Unauthorized");
      if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
        throw new Error("Only vendors can upload thumbnails");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Thumbnail uploaded by:", metadata.userId);
      return { url: file.url, key: file.key };
    }),

  // Avatar uploads (any authenticated user)
  avatarImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Avatar uploaded by:", metadata.userId);
      return { url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
