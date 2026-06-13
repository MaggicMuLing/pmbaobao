const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

async function check(path: string, validate: (json: unknown) => boolean) {
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const json = await response.json();
  if (!validate(json)) {
    throw new Error(`${path} returned an unexpected shape`);
  }

  console.log(`OK ${path}`);
}

await check("/api/categories", (json) => {
  const value = json as { categories?: unknown[] };
  return Array.isArray(value.categories);
});
await check("/api/sites?limit=5", (json) => {
  const value = json as { sites?: unknown[] };
  return Array.isArray(value.sites);
});
await check("/api/search?q=AI", (json) => {
  const value = json as { sites?: unknown[] };
  return Array.isArray(value.sites);
});
await check("/api/sync", (json) => {
  const value = json as { siteCount?: number; categoryCount?: number };
  return typeof value.siteCount === "number" && typeof value.categoryCount === "number";
});

export {};
