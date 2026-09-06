import { apiPath, request } from '@/lib/api';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  children: CategoryNode[];
}

export function fetchCategories(): Promise<CategoryNode[]> {
  return request<CategoryNode[]>(apiPath('/categories'));
}
