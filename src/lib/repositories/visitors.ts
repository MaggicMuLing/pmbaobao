import { Prisma } from "@prisma/client";
import { prisma } from "../db";

interface RecordVisitorInput {
  browserId: string;
  userAgent?: string | null;
}

const BROWSER_ID_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/;

function normalizeBrowserId(browserId: string) {
  const normalized = browserId.trim();

  if (!BROWSER_ID_PATTERN.test(normalized)) {
    throw new Error("Invalid browser id");
  }

  return normalized;
}

export async function getViewerCount() {
  return prisma.visitor.count();
}

export async function recordVisitor(input: RecordVisitorInput) {
  const browserId = normalizeBrowserId(input.browserId);
  const userAgent = input.userAgent?.slice(0, 500) ?? null;
  const now = new Date();

  let created = false;

  try {
    created = true;
    await prisma.visitor.create({
      data: {
        browserId,
        userAgent,
        firstSeenAt: now,
        lastSeenAt: now
      }
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }

    created = false;
    await prisma.visitor.update({
      where: { browserId },
      data: {
        lastSeenAt: now,
        viewCount: {
          increment: 1
        },
        userAgent
      }
    });
  }

  return {
    created,
    viewerCount: await getViewerCount()
  };
}
