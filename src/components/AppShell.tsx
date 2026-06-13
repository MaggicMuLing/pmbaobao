"use client";

import { useMemo, useState } from "react";
import type { CatalogCategory } from "@/lib/types";
import { CategorySection } from "./CategorySection";
import { SearchBar } from "./SearchBar";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

interface AppShellProps {
  categories: CatalogCategory[];
  stats: {
    categoryCount: number;
    siteCount: number;
    lastSyncLabel: string | null;
  };
}

export function AppShell({ categories, stats }: AppShellProps) {
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const allSites = useMemo(
    () =>
      categories.flatMap((category) => [
        ...category.sites,
        ...category.children.flatMap((child) => child.sites)
      ]),
    [categories]
  );
  const uniqueSiteCount = new Set(allSites.map((site) => site.sourceId)).size;

  return (
    <div className="app-shell">
      <Sidebar
        categories={categories}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content" id="top">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            aria-label="打开导航"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="brand-mini">
            <span>AI产品导航</span>
            <small>{uniqueSiteCount || stats.siteCount} sites</small>
          </div>
          <ThemeToggle />
        </header>

        <SearchBar query={query} onQueryChange={setQuery} />

        <section className="bulletin-row" aria-label="站点概览">
          <div className="bulletin-strip">
            <span>BAT一线大厂产品经理、运营、AI课免费领取</span>
            <strong>01/07</strong>
          </div>
          <div className="hot-grid">
            {["微博热搜", "抖音热门", "B站热门", "知乎热门", "人人都是产品经理"].map(
              (item) => (
                <article className="hot-card" key={item}>
                  <span>{item}</span>
                  <a href="#term-1174">更多</a>
                </article>
              )
            )}
          </div>
        </section>

        <section className="personal-tabs">
          <div className="tab-labels">
            <button type="button" className="active">
              我的导航
            </button>
            <button type="button">最近使用</button>
          </div>
          <div className="empty-nav">没有数据！等待你的参与哦 ^_^</div>
        </section>

        <div className="category-stack">
          {categories.map((category) => (
            <CategorySection
              key={category.sourceId}
              category={category}
              query={query}
            />
          ))}
        </div>

        <footer className="site-footer">
          <span>{stats.categoryCount} 个分类</span>
          <span>{stats.siteCount} 个站点</span>
          {stats.lastSyncLabel ? <span>同步于 {stats.lastSyncLabel}</span> : null}
        </footer>
      </main>
    </div>
  );
}
