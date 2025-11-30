import { CategoryController } from "../controllers/category.controller";
import CatchError from "../utils/catch-error";
import { NextRequest } from "next/server";

const categoryController = new CategoryController();

export const GET = CatchError(
  async (req: NextRequest) => await categoryController.getAll(req)
);

export const POST = CatchError(
  async (req: NextRequest) => await categoryController.create(req)
);
