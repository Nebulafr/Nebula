import { NextRequest } from "next/server";
import { categoryService } from "../services/category.service";
import { createCategorySchema, updateCategorySchema, categoryQuerySchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

export class CategoryController {
  async getAll(request: NextRequest) {
    const isAdmin = request.nextUrl.pathname.includes("/admin/");
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = categoryQuerySchema.parse(searchParams);

    const result = await categoryService.getAll(isAdmin, query);
    return sendSuccess(result, "Categories fetched successfully");
  }

  async getById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const result = await categoryService.getById(id);
    return sendSuccess(result, "Category fetched successfully");
  }

  async create(request: NextRequest) {
    const body = await request.json();
    const payload = createCategorySchema.parse(body);
    const result = await categoryService.create(payload);
    return sendSuccess(
      result,
      `Category "${payload.name}" created successfully`,
      201
    );
  }

  async update(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const body = await request.json();
    const payload = updateCategorySchema.parse(body);
    const result = await categoryService.update(id, payload);
    return sendSuccess(result, "Category updated successfully");
  }

  async delete(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const result = await categoryService.delete(id);
    return sendSuccess(result, "Category deleted successfully");
  }
}

export const categoryController = new CategoryController();
