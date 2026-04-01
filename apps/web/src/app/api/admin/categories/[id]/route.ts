import { categoryController } from "../../../controllers/category.controller";
import CatchError from "../../../utils/catch-error";
import { NextRequest } from "next/server";

export const PUT = CatchError(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params;
    return await categoryController.update(request, id);
  },
);

export const DELETE = CatchError(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params;
    return await categoryController.delete(request, id);
  },
);
