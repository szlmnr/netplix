import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Ini yang benar: generate sendiri hook-nya!
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();