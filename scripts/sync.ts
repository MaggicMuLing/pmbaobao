import { prisma } from "../src/lib/db";
import { syncPublicHome } from "../src/lib/scraper/sync";

try {
  const result = await syncPublicHome();
  console.log(
    `Synced ${result.categoryCount} categories and ${result.siteCount} sites.`
  );
  if (result.snapshotPath) {
    console.log(`Snapshot saved: ${result.snapshotPath}`);
  }
} finally {
  await prisma.$disconnect();
}
