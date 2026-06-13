import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const PMBAOBAO_HOME_URL = "https://www.pmbaobao.com/";

export async function fetchHomeHtml(sourceUrl = PMBAOBAO_HOME_URL) {
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
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
