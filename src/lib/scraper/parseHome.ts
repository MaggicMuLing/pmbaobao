import * as cheerio from "cheerio";
import type { ParsedCategory, ParsedHome, ParsedSite } from "../types";

const SOURCE_ORIGIN = "https://www.pmbaobao.com";
type CheerioSelectable = Parameters<cheerio.CheerioAPI>[0];

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function sourceIdFromTerm(value: string | null | undefined) {
  const match = (value ?? "").match(/term-(?:\d+-)?(\d+)/);
  return match?.[1] ?? null;
}

function parentIdFromTerm(value: string | null | undefined) {
  const match = (value ?? "").match(/term-(\d+)-\d+/);
  return match?.[1] ?? null;
}

function tabIdFromPane(value: string | null | undefined) {
  const match = (value ?? "").match(/tab-(\d+)-(\d+)/);
  return match ? { parentId: match[1], childId: match[2] } : null;
}

function toAbsoluteUrl(value: string | null | undefined) {
  const url = normalizeText(value);
  if (!url) return null;

  try {
    return new URL(url, SOURCE_ORIGIN).toString();
  } catch {
    return url;
  }
}

function addCategory(
  categories: Map<string, ParsedCategory>,
  category: ParsedCategory
) {
  const existing = categories.get(category.sourceId);

  if (!existing) {
    categories.set(category.sourceId, category);
    return;
  }

  categories.set(category.sourceId, {
    ...existing,
    ...category,
    name: category.name || existing.name,
    iconClass: category.iconClass ?? existing.iconClass,
    parentSourceId: category.parentSourceId ?? existing.parentSourceId,
    kind: existing.kind === "sidebar" ? existing.kind : category.kind
  });
}

function categoryFromHeading($: cheerio.CheerioAPI, heading: CheerioSelectable) {
  const $heading = $(heading);
  const icon = $heading.find("i[id^='term-']").first();
  const sourceId = sourceIdFromTerm(icon.attr("id"));

  if (!sourceId) return null;

  const name = normalizeText(
    $heading
      .contents()
      .toArray()
      .filter((node) => node.type === "text")
      .map((node) => $(node).text())
      .join(" ")
  );

  if (!name) return null;

  return {
    sourceId,
    parentSourceId: null,
    name,
    slug: `term-${sourceId}`,
    iconClass: normalizeText(icon.attr("class")),
    kind: "section" as const,
    sortOrder: 0
  };
}

function cardToSite(
  $: cheerio.CheerioAPI,
  card: CheerioSelectable,
  categorySourceIds: string[],
  sortOrder: number
): ParsedSite | null {
  const $card = $(card);
  const sourceId = normalizeText($card.attr("data-id"));

  if (!sourceId) return null;

  const title =
    normalizeText($card.find("strong").first().text()) ||
    normalizeText($card.find("img").first().attr("alt")) ||
    normalizeText($card.text());
  const description =
    normalizeText($card.find("p").first().text()) ||
    normalizeText($card.attr("title")) ||
    null;
  const image = $card.find("img").first();
  const iconUrl = toAbsoluteUrl(image.attr("data-src") || image.attr("src"));

  return {
    sourceId,
    sourceDetailUrl: toAbsoluteUrl($card.attr("href")) ?? "",
    title,
    description,
    outboundUrl: normalizeText($card.attr("data-url")) || null,
    iconUrl,
    isNoContentCard: ($card.attr("class") ?? "").split(/\s+/).includes("no-c"),
    sortOrder,
    categorySourceIds
  };
}

function addSite(sites: Map<string, ParsedSite>, site: ParsedSite) {
  const existing = sites.get(site.sourceId);

  if (!existing) {
    sites.set(site.sourceId, site);
    return;
  }

  sites.set(site.sourceId, {
    ...existing,
    ...site,
    categorySourceIds: Array.from(
      new Set([...existing.categorySourceIds, ...site.categorySourceIds])
    )
  });
}

export function parseHome(html: string): ParsedHome {
  const $ = cheerio.load(html);
  const categories = new Map<string, ParsedCategory>();
  const sites = new Map<string, ParsedSite>();

  $("#sidebar .sidebar-item").each((index, item) => {
    const link = $(item).children("a").first();
    const sourceId = sourceIdFromTerm(link.attr("href"));
    const name = normalizeText(link.find("span").first().text());

    if (!sourceId || !name) return;

    addCategory(categories, {
      sourceId,
      parentSourceId: null,
      name,
      slug: `term-${sourceId}`,
      iconClass: normalizeText(link.find("i").first().attr("class")),
      kind: "sidebar",
      sortOrder: index
    });

    $(item)
      .children("ul")
      .find("a[href^='#term-']")
      .each((childIndex, childLink) => {
        const href = $(childLink).attr("href");
        const childSourceId = sourceIdFromTerm(href);
        const childName = normalizeText($(childLink).find("span").first().text());

        if (!childSourceId || !childName) return;

        addCategory(categories, {
          sourceId: childSourceId,
          parentSourceId: sourceId,
          name: childName,
          slug: `term-${childSourceId}`,
          iconClass: null,
          kind: "tab",
          sortOrder: childIndex
        });
      });
  });

  $(".parent-category[id^='term-']").each((_, parent) => {
    const parentSourceId = sourceIdFromTerm($(parent).attr("id"));
    if (!parentSourceId) return;

    const tabMenu = $(parent).nextAll(".slider_menu").first();
    tabMenu.find(".nav-link").each((tabIndex, tabLink) => {
      const $tabLink = $(tabLink);
      const sourceId =
        sourceIdFromTerm($tabLink.attr("id")) ||
        normalizeText($tabLink.closest("[data-id]").attr("data-id"));
      const name = normalizeText($tabLink.text());

      if (!sourceId || !name) return;

      addCategory(categories, {
        sourceId,
        parentSourceId,
        name,
        slug: `term-${sourceId}`,
        iconClass: null,
        kind: "tab",
        sortOrder: tabIndex
      });
    });
  });

  $("h4").each((headingIndex, heading) => {
    const category = categoryFromHeading($, heading);
    if (!category) return;

    addCategory(categories, {
      ...category,
      kind: categories.get(category.sourceId)?.kind ?? category.kind,
      sortOrder: headingIndex
    });
  });

  $(".tab-pane[id^='tab-']").each((_, pane) => {
    const paneIds = tabIdFromPane($(pane).attr("id"));
    if (!paneIds) return;

    $(pane)
      .find(".url-card a.card")
      .each((siteIndex, card) => {
        const site = cardToSite($, card, [paneIds.childId], siteIndex);
        if (site) addSite(sites, site);
      });
  });

  $("h4").each((_, heading) => {
    const category = categoryFromHeading($, heading);
    if (!category) return;

    $(heading)
      .closest(".d-flex")
      .nextAll(".row")
      .first()
      .find(".url-card a.card")
      .each((siteIndex, card) => {
        const site = cardToSite($, card, [category.sourceId], siteIndex);
        if (site) addSite(sites, site);
      });
  });

  return {
    categories: Array.from(categories.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    ),
    sites: Array.from(sites.values()).sort((a, b) => a.sortOrder - b.sortOrder)
  };
}
