import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseHome, parseTabSites } from "./parseHome";

const fixture = readFileSync(
  join(process.cwd(), "src/lib/scraper/fixtures/pmbaobao.sample.html"),
  "utf8"
);

describe("parseHome", () => {
  it("parses sidebar and tab categories", () => {
    const parsed = parseHome(fixture);

    expect(parsed.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "1174",
          name: "Ai 工具人",
          kind: "sidebar",
          iconClass: expect.stringContaining("icon-google")
        }),
        expect.objectContaining({
          sourceId: "1176",
          parentSourceId: "1174",
          name: "热门AI",
          kind: "tab"
        }),
        expect.objectContaining({
          sourceId: "138",
          name: "行业视野",
          kind: "sidebar"
        })
      ])
    );
  });

  it("parses site cards and links them to their nearest category", () => {
    const parsed = parseHome(fixture);

    expect(parsed.sites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: "3047",
          sourceDetailUrl: "https://www.pmbaobao.com/sites/3047.html",
          outboundUrl: "https://sora.chatgpt.com",
          title: "Sora",
          description: "全球顶流AI视频工具",
          iconUrl: "https://www.pmbaobao.com/sora.png",
          isNoContentCard: true,
          categorySourceIds: ["1176"]
        }),
        expect.objectContaining({
          sourceId: "3006",
          title: "Cursor",
          categorySourceIds: ["1412"]
        }),
        expect.objectContaining({
          sourceId: "889",
          title: "人人都是产品经理",
          categorySourceIds: ["138"]
        })
      ])
    );
  });

  it("parses cards loaded by tab ajax", () => {
    const ajaxHtml = `
      <div class="url-card ajax-url">
        <a href="https://www.pmbaobao.com/sites/3020.html" data-id="3020" data-url="https://windsurf.com" class="card no-c site-3020" title="AI编程老大哥之一">
          <img src="https://www.pmbaobao.com/favicon.png" data-src="https://www.pmbaobao.com/windsurf.jpg" alt="Windsurf" />
          <strong>Windsurf</strong>
          <p>AI编程老大哥之一</p>
        </a>
      </div>
    `;

    expect(parseTabSites(ajaxHtml, "1412")).toEqual([
      expect.objectContaining({
        sourceId: "3020",
        title: "Windsurf",
        outboundUrl: "https://windsurf.com",
        categorySourceIds: ["1412"]
      })
    ]);
  });

  it("discovers ajax tabs nested in the header row", () => {
    const parsed = parseHome(`
      <div class="parent-category" id="term-1174"></div>
      <div class="d-flex flex-fill flex-tab">
        <div class="slider_menu mini_tab ajax-list-home" data-id="1174">
          <ul>
            <li class="pagenumber nav-item" data-sidebar="0" data-post_id="0" data-action="load_home_tab" data-taxonomy="favorites" data-id="1412">
              <a id="term-1174-1412" class="nav-link" href="#tab-1174-1412">AI编程</a>
            </li>
          </ul>
        </div>
      </div>
    `);

    expect(parsed.ajaxTabs).toEqual([
      {
        sourceId: "1412",
        parentSourceId: "1174",
        action: "load_home_tab",
        taxonomy: "favorites",
        postId: "0",
        sidebar: "0"
      }
    ]);
  });
});
