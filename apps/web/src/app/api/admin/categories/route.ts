import { categoryController } from "../../controllers/category.controller";
import CatchError from "../../utils/catch-error";
import { NextRequest } from "next/server";

export const GET = CatchError(
  async (req: NextRequest) => await categoryController.getAll(req),
);

export const POST = CatchError(
  async (req: NextRequest) => await categoryController.create(req),
);
