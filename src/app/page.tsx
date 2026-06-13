import { AppShell } from "@/components/AppShell";
import { getCatalog, getSyncStatus } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [catalog, syncStatus] = await Promise.all([getCatalog(), getSyncStatus()]);

  return (
    <AppShell
      categories={catalog.categories}
      stats={{
        categoryCount: catalog.categoryCount,
        siteCount: catalog.siteCount,
        lastSyncLabel: syncStatus.lastSync?.finishedAt
          ? new Intl.DateTimeFormat("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false
            }).format(syncStatus.lastSync.finishedAt)
          : null
      }}
    />
  );
}
