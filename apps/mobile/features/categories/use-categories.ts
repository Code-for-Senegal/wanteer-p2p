import { useQuery } from '@tanstack/react-query';
import { apiPath, request } from '@/lib/api';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  children: CategoryNode[];
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => request<CategoryNode[]>(apiPath('/categories')),
    staleTime: 5 * 60_000,
  });
}
