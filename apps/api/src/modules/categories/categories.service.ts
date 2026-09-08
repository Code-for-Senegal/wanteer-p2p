import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import type { CategoryNode } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async tree(): Promise<CategoryNode[]> {
    const categories = await this.prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const nodes = new Map<string, CategoryNode>();
    for (const category of categories) {
      nodes.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        sortOrder: category.sortOrder,
        children: [],
      });
    }

    const roots: CategoryNode[] = [];
    for (const category of categories) {
      const node = nodes.get(category.id)!;
      const parent = category.parentId ? nodes.get(category.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug, active: true },
      include: { children: { where: { active: true }, orderBy: { sortOrder: 'asc' } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, slug: slugify(dto.name) },
    });
  }

  update(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(dto.name ? { slug: slugify(dto.name) } : {}) },
    });
  }
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
