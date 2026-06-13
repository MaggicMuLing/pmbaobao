"use client";

import type { CatalogCategory } from "@/lib/types";

interface SidebarProps {
  categories: CatalogCategory[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ categories, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">AI</div>
          <div>
            <strong>AI产品导航</strong>
            <span>pmbaobao</span>
          </div>
        </div>
        <nav className="sidebar-menu">
          {categories.map((category) => (
            <div className="sidebar-group" key={category.sourceId}>
              <a href={`#term-${category.sourceId}`} onClick={onClose}>
                <span className="sidebar-icon">
                  {category.name.slice(0, 1).toUpperCase()}
                </span>
                <span>{category.name}</span>
              </a>
              {category.children.length > 0 ? (
                <div className="sidebar-children">
                  {category.children.map((child) => (
                    <a
                      href={`#term-${category.sourceId}`}
                      key={child.sourceId}
                      onClick={onClose}
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>
      {isOpen ? (
        <button className="sidebar-backdrop" aria-label="关闭导航" onClick={onClose} />
      ) : null}
    </>
  );
}
