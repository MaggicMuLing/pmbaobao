import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseHome } from "./parseHome";

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
});
