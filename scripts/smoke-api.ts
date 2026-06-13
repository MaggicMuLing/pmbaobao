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

async function checkPost(
  path: string,
  body: unknown,
  validate: (json: unknown) => boolean
) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const json = await response.json();
  if (!validate(json)) {
    throw new Error(`${path} returned an unexpected shape`);
  }

  console.log(`OK POST ${path}`);
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
await check("/api/visitors", (json) => {
  const value = json as { viewerCount?: number };
  return typeof value.viewerCount === "number";
});
await checkPost(
  "/api/visitors",
  { browserId: `smoke-${Date.now().toString(36)}` },
  (json) => {
    const value = json as { viewerCount?: number; created?: boolean };
    return typeof value.viewerCount === "number" && typeof value.created === "boolean";
  }
);

export {};
