import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../db";
import { getViewerCount, recordVisitor } from "./visitors";

const testPrefix = "test-browser-";

describe("visitor tracking", () => {
  beforeEach(async () => {
    await prisma.visitor.deleteMany({
      where: {
        browserId: {
          startsWith: testPrefix
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.visitor.deleteMany({
      where: {
        browserId: {
          startsWith: testPrefix
        }
      }
    });
    await prisma.$disconnect();
  });

  it("counts the same browser only once", async () => {
    const before = await getViewerCount();
    const browserId = `${testPrefix}${Date.now()}`;

    const first = await recordVisitor({
      browserId,
      userAgent: "vitest"
    });
    const second = await recordVisitor({
      browserId,
      userAgent: "vitest"
    });

    expect(first.created).toBe(true);
    expect(first.viewerCount).toBe(before + 1);
    expect(second.created).toBe(false);
    expect(second.viewerCount).toBe(before + 1);
  });
});
