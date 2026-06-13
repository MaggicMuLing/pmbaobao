"use client";

import { useMemo, useState } from "react";
import type { CatalogCategory, CatalogSite } from "@/lib/types";
import { SiteCard } from "./SiteCard";

interface CategorySectionProps {
  category: CatalogCategory;
  query: string;
}

function matchesQuery(site: CatalogSite, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return [site.title, site.description, site.outboundUrl]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(value));
}

export function CategorySection({ category, query }: CategorySectionProps) {
  const firstChild = category.children[0]?.sourceId ?? "";
  const [activeChild, setActiveChild] = useState(firstChild);
  const visibleSites = useMemo(() => {
    if (category.children.length === 0) {
      return category.sites.filter((site) => matchesQuery(site, query));
    }

    const selected =
      category.children.find((child) => child.sourceId === activeChild) ??
      category.children[0];

    if (!selected) return [];
    return selected.sites.filter((site) => matchesQuery(site, query));
  }, [activeChild, category, query]);

  return (
    <section className="category-section" id={`term-${category.sourceId}`}>
      <div className="section-heading">
        <h2>
          <span>{category.name.slice(0, 1).toUpperCase()}</span>
          {category.name}
        </h2>
        <a href="#top">more+</a>
      </div>

      {category.children.length > 0 ? (
        <div className="category-tabs">
          {category.children.map((child) => (
            <button
              key={child.sourceId}
              type="button"
              className={child.sourceId === (activeChild || firstChild) ? "active" : ""}
              onClick={() => setActiveChild(child.sourceId)}
            >
              {child.name}
            </button>
          ))}
        </div>
      ) : null}

      {visibleSites.length > 0 ? (
        <div className="site-grid">
          {visibleSites.map((site) => (
            <SiteCard key={`${category.sourceId}-${site.sourceId}`} site={site} />
          ))}
        </div>
      ) : (
        <div className="empty-section">没有数据！等待你的参与哦 ^_^</div>
      )}
    </section>
  );
}
