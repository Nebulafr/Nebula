import { prisma, Prisma } from "@nebula/database";
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
import { generateSlug } from "@/lib/utils";
import { uploadService } from "@nebula/integrations";

export class CategoryService {
  private async handleImageUpload(assetUrl?: string | null): Promise<string | null> {
    if (!assetUrl || !assetUrl.startsWith("data:image/")) {
      return assetUrl || null;
    }

    try {
      const uploadResult = await uploadService.uploadFile(assetUrl, {
        folder: "categories",
        resourceType: "image",
      });
      return uploadResult.url;
    } catch (error) {
      console.error("Error uploading category image:", error);
      return assetUrl;
    }
  }

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
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
  async getAll(isAdmin: boolean = false, options: { page?: number; limit?: number; search?: string } = {}): Promise<any> {
    const { page, limit, search } = options;

    const where: Prisma.CategoryWhereInput = {
      ...(isAdmin ? {} : { isActive: true }),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    };

    if (!page || !limit) {
      const categories = await prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
      });
      return { categories };
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getById(id: string): Promise<any> {
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

    return { category };
  }

  async create(data: CreateCategoryData): Promise<any> {
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
    const assetUrl = await this.handleImageUpload(data.assetUrl);

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        assetUrl,
        description: data.description || null,
      },
    });

    return { category };
  }

  async update(id: string, data: UpdateCategoryData): Promise<any> {
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

    const assetUrl = data.assetUrl !== undefined
      ? await this.handleImageUpload(data.assetUrl)
      : existingCategory.assetUrl;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? existingCategory.name,
        slug:
          data.name && data.name !== existingCategory.name
            ? await this.generateUniqueSlug(data.name, id)
            : existingCategory.slug,
        isActive: data.isActive ?? existingCategory.isActive,
        assetUrl,
        description: data.description !== undefined ? (data.description || null) : existingCategory.description,
        updatedAt: new Date(),
      },
    });

    return { category };
  }

  async delete(id: string): Promise<any> {
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

    return null;
  }
}

export const categoryService = new CategoryService();
