import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ParsedAjaxTab } from "../types";

export const PMBAOBAO_HOME_URL = "https://www.pmbaobao.com/";
export const PMBAOBAO_AJAX_URL = "https://www.pmbaobao.com/wp-admin/admin-ajax.php";

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml"
};

export async function fetchHomeHtml(sourceUrl = PMBAOBAO_HOME_URL) {
  const response = await fetch(sourceUrl, {
    headers: REQUEST_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function fetchHomeTabHtml(tab: ParsedAjaxTab) {
  const url = new URL(PMBAOBAO_AJAX_URL);
  url.searchParams.set("action", tab.action);
  url.searchParams.set("id", tab.sourceId);

  if (tab.taxonomy) url.searchParams.set("taxonomy", tab.taxonomy);
  if (tab.postId) url.searchParams.set("post_id", tab.postId);
  if (tab.sidebar) url.searchParams.set("sidebar", tab.sidebar);

  const response = await fetch(url, {
    headers: REQUEST_HEADERS
  });

  if (!response.ok) {
    throw new Error(
      `Fetch tab ${tab.sourceId} failed: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

export async function cacheHomeHtml(html: string) {
  const cacheDir = join(process.cwd(), ".cache", "pmbaobao");
  await mkdir(cacheDir, { recursive: true });

  const filePath = join(cacheDir, `home-${Date.now()}.html`);
  await writeFile(filePath, html, "utf8");
  return filePath;
}
