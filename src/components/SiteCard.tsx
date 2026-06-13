"use client";

import type { CatalogSite } from "@/lib/types";

interface SiteCardProps {
  site: CatalogSite;
}

export function SiteCard({ site }: SiteCardProps) {
  const href = site.outboundUrl || site.sourceDetailUrl;

  return (
    <a className="site-card" href={href} target="_blank" rel="noreferrer">
      <span className="site-icon">
        {site.iconUrl ? (
          <img
            src={site.iconUrl}
            alt=""
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <b>{site.title.slice(0, 1).toUpperCase()}</b>
      </span>
      <span className="site-info">
        <strong>{site.title}</strong>
        <small>{site.description || site.outboundUrl}</small>
      </span>
    </a>
  );
}
