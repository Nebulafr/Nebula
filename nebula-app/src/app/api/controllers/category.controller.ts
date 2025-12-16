import { NextRequest } from "next/server";
import { CategoryService } from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations";
import { BadRequestException } from "../utils/http-exception";

export class CategoryController {
  async getAll(request: NextRequest) {
    return await CategoryService.getAll();
  }

  async getById(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    return await CategoryService.getById(id);
  }

  async create(request: NextRequest) {
    const body = await request.json();
    const payload = createCategorySchema.parse(body);
    return await CategoryService.create(payload);
  }

  async update(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const body = await request.json();
    const payload = updateCategorySchema.parse(body);
    return await CategoryService.update(id, payload);
  }

  async delete(request: NextRequest, id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    return await CategoryService.delete(id);
  }
}
