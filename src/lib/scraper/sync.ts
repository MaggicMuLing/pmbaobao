import { prisma } from "../db";
import type { ParsedHome } from "../types";
import { cacheHomeHtml, fetchHomeHtml, PMBAOBAO_HOME_URL } from "./fetchHome";
import { parseHome } from "./parseHome";

interface SyncOptions {
  html?: string;
  sourceUrl?: string;
  cacheSnapshot?: boolean;
}

export interface SyncResult {
  categoryCount: number;
  siteCount: number;
  snapshotPath: string | null;
}

async function upsertParsedHome(parsed: ParsedHome) {
  for (const category of parsed.categories) {
    await prisma.category.upsert({
      where: { sourceId: category.sourceId },
      create: category,
      update: {
        parentSourceId: category.parentSourceId,
        name: category.name,
        slug: category.slug,
        iconClass: category.iconClass,
        kind: category.kind,
        sortOrder: category.sortOrder
      }
    });
  }

  const categoryRows = await prisma.category.findMany({
    where: { sourceId: { in: parsed.categories.map((category) => category.sourceId) } },
    select: { id: true, sourceId: true }
  });
  const categoryIdBySourceId = new Map(
    categoryRows.map((category) => [category.sourceId, category.id])
  );

  for (const site of parsed.sites) {
    const siteRow = await prisma.site.upsert({
      where: { sourceId: site.sourceId },
      create: {
        sourceId: site.sourceId,
        sourceDetailUrl: site.sourceDetailUrl,
        title: site.title,
        description: site.description,
        outboundUrl: site.outboundUrl,
        iconUrl: site.iconUrl,
        isNoContentCard: site.isNoContentCard,
        sortOrder: site.sortOrder
      },
      update: {
        sourceDetailUrl: site.sourceDetailUrl,
        title: site.title,
        description: site.description,
        outboundUrl: site.outboundUrl,
        iconUrl: site.iconUrl,
        isNoContentCard: site.isNoContentCard,
        sortOrder: site.sortOrder
      }
    });

    await prisma.siteCategory.deleteMany({
      where: { siteId: siteRow.id }
    });

    for (const [index, categorySourceId] of site.categorySourceIds.entries()) {
      const categoryId = categoryIdBySourceId.get(categorySourceId);
      if (!categoryId) continue;

      await prisma.siteCategory.upsert({
        where: {
          siteId_categoryId: {
            siteId: siteRow.id,
            categoryId
          }
        },
        create: {
          siteId: siteRow.id,
          categoryId,
          sortOrder: index
        },
        update: {
          sortOrder: index
        }
      });
    }
  }
}

export async function syncPublicHome(options: SyncOptions = {}): Promise<SyncResult> {
  const sourceUrl = options.sourceUrl ?? PMBAOBAO_HOME_URL;
  const syncRun = await prisma.syncRun.create({
    data: {
      sourceUrl,
      status: "running"
    }
  });

  try {
    const html = options.html ?? (await fetchHomeHtml(sourceUrl));
    const snapshotPath =
      options.cacheSnapshot === false ? null : await cacheHomeHtml(html);
    const parsed = parseHome(html);

    await upsertParsedHome(parsed);

    const result = {
      categoryCount: parsed.categories.length,
      siteCount: parsed.sites.length,
      snapshotPath
    };

    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        categoryCount: result.categoryCount,
        siteCount: result.siteCount,
        message: snapshotPath ? `Snapshot: ${snapshotPath}` : null
      }
    });

    return result;
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        message: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}
