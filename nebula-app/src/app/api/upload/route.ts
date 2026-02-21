import { NextRequest } from "next/server";
import { isAuthenticated } from "@/app/api/middleware/auth";
import { uploadController } from "@/app/api/controllers/upload.controller";
import CatchError from "@/app/api/utils/catch-error";

export const POST = CatchError(
    isAuthenticated(async (req: NextRequest) => {
        return await uploadController.upload(req);
    })
);
