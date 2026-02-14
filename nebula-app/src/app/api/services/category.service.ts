import { prisma } from "@/lib/prisma";
import {
  type CreateCategoryData,
  type UpdateCategoryData,
} from "@/lib/validations";
import {
  NotFoundException,
  BadRequestException,
} from "../utils/http-exception";
import { RESPONSE_CODE } from "@/types";
import HttpException from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";
import { generateSlug } from "@/lib/utils";

export class CategoryService {
  private async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const category = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return !!category;
  }

  private async generateUniqueSlug(
    name: string,
    excludeId?: string
  ): Promise<string> {
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
  async getAll() {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return sendSuccess({ categories }, "Categories fetched successfully");
  }

  async getById(id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        programs: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return sendSuccess({ category }, "Category fetched successfully");
  }

  async create(data: CreateCategoryData) {
    const { name } = data;

    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      throw new HttpException(
        RESPONSE_CODE.USER_ALREADY_EXIST,
        `A category with the name "${name}" already exists`,
        400
      );
    }

    const slug = await this.generateUniqueSlug(name);

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
      },
    });

    return sendSuccess(
      { category },
      `Category "${name}" created successfully`,
      201
    );
  }

  async update(id: string, data: UpdateCategoryData) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException("The specified category does not exist");
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? existingCategory.name,
        slug:
          data.name && data.name !== existingCategory.name
            ? await this.generateUniqueSlug(data.name, id)
            : existingCategory.slug,
        isActive: data.isActive ?? existingCategory.isActive,
        updatedAt: new Date(),
      },
    });

    return sendSuccess({ category }, "Category updated successfully");
  }

  async delete(id: string) {
    if (!id) {
      throw new BadRequestException("Category ID is required");
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException("The specified category does not exist");
    }

    const activePrograms = await prisma.program.findFirst({
      where: {
        categoryId: id,
        status: "ACTIVE",
      },
    });

    if (activePrograms) {
      throw new BadRequestException(
        `Cannot delete category "${existingCategory.name}" because it has active programs. Please reassign or delete the programs first.`
      );
    }

    await prisma.category.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return sendSuccess(
      null,
      `Category "${existingCategory.name}" deleted successfully`
    );
  }
}

export const categoryService = new CategoryService();
