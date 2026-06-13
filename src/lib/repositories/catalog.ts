import { prisma } from "../db";
import type { CatalogCategory, CatalogSite } from "../types";

interface GetSitesOptions {
  category?: string | null;
  q?: string | null;
  limit?: number;
  offset?: number;
}

function toCatalogSite(
  site: {
    id: number;
    sourceId: string;
    sourceDetailUrl: string;
    title: string;
    description: string | null;
    outboundUrl: string | null;
    iconUrl: string | null;
    isNoContentCard: boolean;
    sortOrder: number;
    categories?: { categoryId: number }[];
  },
  fallbackCategoryIds: number[] = []
): CatalogSite {
  return {
    id: site.id,
    sourceId: site.sourceId,
    sourceDetailUrl: site.sourceDetailUrl,
    title: site.title,
    description: site.description,
    outboundUrl: site.outboundUrl,
    iconUrl: site.iconUrl,
    isNoContentCard: site.isNoContentCard,
    sortOrder: site.sortOrder,
    categoryIds:
      site.categories?.map((category) => category.categoryId) ?? fallbackCategoryIds
  };
}

export async function getCatalog() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      sites: {
        orderBy: [{ sortOrder: "asc" }],
        include: {
          site: {
            include: {
              categories: {
                select: { categoryId: true }
              }
            }
          }
        }
      }
    }
  });

  const categoryBySourceId = new Map<string, CatalogCategory>();
  const roots: CatalogCategory[] = [];

  for (const category of categories) {
    categoryBySourceId.set(category.sourceId, {
      id: category.id,
      sourceId: category.sourceId,
      parentSourceId: category.parentSourceId,
      name: category.name,
      slug: category.slug,
      iconClass: category.iconClass,
      kind: category.kind as CatalogCategory["kind"],
      sortOrder: category.sortOrder,
      children: [],
      sites: category.sites.map((relation) => toCatalogSite(relation.site))
    });
  }

  for (const category of categoryBySourceId.values()) {
    const parent =
      category.parentSourceId && categoryBySourceId.get(category.parentSourceId);

    if (parent) {
      parent.children.push(category);
    } else {
      roots.push(category);
    }
  }

  for (const category of categoryBySourceId.values()) {
    category.children.sort((a, b) => a.sortOrder - b.sortOrder);
    category.sites.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    categories: roots,
    flatCategories: Array.from(categoryBySourceId.values()),
    siteCount: await prisma.site.count(),
    categoryCount: await prisma.category.count()
  };
}

export async function getSites(options: GetSitesOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 80, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const q = options.q?.trim();

  const category = options.category
    ? await prisma.category.findFirst({
        where: {
          OR: [
            { slug: options.category },
            { sourceId: options.category },
            { name: options.category }
          ]
        },
        select: { id: true }
      })
    : null;

  const sites = await prisma.site.findMany({
    where: {
      AND: [
        category
          ? {
              categories: {
                some: { categoryId: category.id }
              }
            }
          : {},
        q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { outboundUrl: { contains: q } }
              ]
            }
          : {}
      ]
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    skip: offset,
    take: limit,
    include: {
      categories: {
        select: { categoryId: true }
      }
    }
  });

  return sites.map((site) => toCatalogSite(site));
}

export async function searchSites(q: string) {
  return getSites({ q, limit: 80, offset: 0 });
}

export async function getSyncStatus() {
  const [lastSync, siteCount, categoryCount] = await Promise.all([
    prisma.syncRun.findFirst({
      orderBy: { startedAt: "desc" }
    }),
    prisma.site.count(),
    prisma.category.count()
  ]);

  return {
    lastSync,
    siteCount,
    categoryCount
  };
}
