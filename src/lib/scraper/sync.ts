import { prisma } from "../db";
import type { ParsedHome, ParsedSite } from "../types";
import {
  cacheHomeHtml,
  fetchHomeHtml,
  fetchHomeTabHtml,
  PMBAOBAO_HOME_URL
} from "./fetchHome";
import { parseHome, parseTabSites } from "./parseHome";

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

function mergeParsedSite(
  sitesBySourceId: Map<string, ParsedSite>,
  site: ParsedSite
) {
  const existing = sitesBySourceId.get(site.sourceId);

  if (!existing) {
    sitesBySourceId.set(site.sourceId, site);
    return;
  }

  sitesBySourceId.set(site.sourceId, {
    ...existing,
    ...site,
    categorySourceIds: Array.from(
      new Set([...existing.categorySourceIds, ...site.categorySourceIds])
    ),
    categorySortOrders: {
      ...existing.categorySortOrders,
      ...site.categorySortOrders
    }
  });
}

async function hydrateAjaxTabs(parsed: ParsedHome) {
  const sitesBySourceId = new Map<string, ParsedSite>();

  for (const site of parsed.sites) {
    mergeParsedSite(sitesBySourceId, site);
  }

  for (const tab of parsed.ajaxTabs) {
    const hasSites = Array.from(sitesBySourceId.values()).some((site) =>
      site.categorySourceIds.includes(tab.sourceId)
    );

    if (hasSites) continue;

    const tabHtml = await fetchHomeTabHtml(tab);
    const tabSites = parseTabSites(tabHtml, tab.sourceId);

    for (const site of tabSites) {
      mergeParsedSite(sitesBySourceId, site);
    }
  }

  return {
    ...parsed,
    sites: Array.from(sitesBySourceId.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    )
  };
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
      const sortOrder = site.categorySortOrders[categorySourceId] ?? index;

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
          sortOrder
        },
        update: {
          sortOrder
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
    const parsed = await hydrateAjaxTabs(parseHome(html));

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
