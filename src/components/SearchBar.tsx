"use client";

import { FormEvent, useState } from "react";

const engines = [
  { key: "baidu", label: "百度", url: "https://www.baidu.com/s?wd=" },
  { key: "google", label: "Google", url: "https://www.google.com/search?q=" },
  { key: "bing", label: "Bing", url: "https://www.bing.com/search?q=" },
  { key: "site", label: "站内", url: "" }
];

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const [engine, setEngine] = useState(engines[0]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    if (!value || engine.key === "site") return;
    window.open(`${engine.url}${encodeURIComponent(value)}`, "_blank", "noreferrer");
  }

  return (
    <section className="search-panel">
      <div className="search-tabs">
        {["搜索", "社区", "工具", "生活", "常用", "求职"].map((label, index) => (
          <span className={index === 0 ? "active" : ""} key={label}>
            {label}
          </span>
        ))}
      </div>
      <form className="search-box" onSubmit={handleSubmit}>
        <div className="engine-tabs">
          {engines.map((item) => (
            <button
              key={item.key}
              type="button"
              className={engine.key === item.key ? "active" : ""}
              onClick={() => setEngine(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索站点 / 工具 / 链接"
        />
        <button type="submit">搜索</button>
      </form>
    </section>
  );
}
