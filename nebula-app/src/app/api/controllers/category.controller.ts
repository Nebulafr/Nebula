import { NextRequest } from "next/server";
import { categoryService } from "../services/category.service";
import { createCategorySchema, updateCategorySchema, categoryQuerySchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

export class CategoryController {
  async getAll(request: NextRequest) {
    const isAdmin = request.nextUrl.pathname.includes("/admin/");
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = categoryQuerySchema.parse(searchParams);

    return await categoryService.getAll(isAdmin, query);
  }

  async getById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    return await categoryService.getById(id);
  }

  async create(request: NextRequest) {
    const body = await request.json();
    const payload = createCategorySchema.parse(body);
    return await categoryService.create(payload);
  }

  async update(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const body = await request.json();
    const payload = updateCategorySchema.parse(body);
    return await categoryService.update(id, payload);
  }

  async delete(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    return await categoryService.delete(id);
  }
}

export const categoryController = new CategoryController();
