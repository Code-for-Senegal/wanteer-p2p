import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const categories = [
  {
    name: 'Éducation',
    slug: 'education',
    icon: 'book',
    children: [
      { name: 'Fournitures scolaires', slug: 'fournitures-scolaires' },
      { name: 'Livres et manuels', slug: 'livres-et-manuels' },
      { name: 'Uniformes', slug: 'uniformes' },
    ],
  },
  {
    name: 'Maison',
    slug: 'maison',
    icon: 'home',
    children: [
      { name: 'Meubles', slug: 'meubles' },
      { name: 'Électroménager', slug: 'electromenager' },
      { name: 'Cuisine', slug: 'cuisine' },
    ],
  },
  {
    name: 'Mode',
    slug: 'mode',
    icon: 'shirt',
    children: [
      { name: 'Vêtements', slug: 'vetements' },
      { name: 'Chaussures', slug: 'chaussures' },
    ],
  },
  {
    name: 'Électronique',
    slug: 'electronique',
    icon: 'smartphone',
    children: [
      { name: 'Téléphones', slug: 'telephones' },
      { name: 'Ordinateurs', slug: 'ordinateurs' },
    ],
  },
  { name: 'Enfants', slug: 'enfants', icon: 'baby', children: [] },
  { name: 'Services', slug: 'services', icon: 'wrench', children: [] },
];

async function main(): Promise<void> {
  for (const [index, category] of categories.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      create: { name: category.name, slug: category.slug, icon: category.icon, sortOrder: index },
      update: { name: category.name, icon: category.icon, sortOrder: index },
    });

    for (const [childIndex, child] of category.children.entries()) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          sortOrder: childIndex,
        },
        update: { name: child.name, parentId: parent.id, sortOrder: childIndex },
      });
    }
  }

  process.stdout.write(`Seeded ${categories.length} root categories\n`);
}

main()
  .catch((error) => {
    process.exitCode = 1;
    console.error(error);
  })
  .finally(() => prisma.$disconnect());
