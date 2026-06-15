export type CategoryKind = "sidebar" | "tab" | "section";

export interface CatalogCategory {
  id: number;
  sourceId: string;
  parentSourceId: string | null;
  name: string;
  slug: string;
  iconClass: string | null;
  kind: CategoryKind;
  sortOrder: number;
  children: CatalogCategory[];
  sites: CatalogSite[];
}

export interface CatalogSite {
  id: number;
  sourceId: string;
  sourceDetailUrl: string;
  title: string;
  description: string | null;
  outboundUrl: string | null;
  iconUrl: string | null;
  isNoContentCard: boolean;
  sortOrder: number;
  categoryIds: number[];
}

export interface ParsedCategory {
  sourceId: string;
  parentSourceId: string | null;
  name: string;
  slug: string;
  iconClass: string | null;
  kind: CategoryKind;
  sortOrder: number;
}

export interface ParsedSite {
  sourceId: string;
  sourceDetailUrl: string;
  title: string;
  description: string | null;
  outboundUrl: string | null;
  iconUrl: string | null;
  isNoContentCard: boolean;
  sortOrder: number;
  categorySourceIds: string[];
  categorySortOrders: Record<string, number>;
}

export interface ParsedHome {
  categories: ParsedCategory[];
  sites: ParsedSite[];
  ajaxTabs: ParsedAjaxTab[];
}

export interface ParsedAjaxTab {
  sourceId: string;
  parentSourceId: string;
  action: string;
  taxonomy: string | null;
  postId: string | null;
  sidebar: string | null;
}
