import { Router } from "express";
import { prisma } from "../prisma";

export const menuRouter = Router();

menuRouter.get("/", async (_req, res) => {
  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isActive: true },
        include: {
          variantGroups: {
            include: {
              variantGroup: { include: { options: { orderBy: { sortOrder: "asc" } } } },
            },
          },
        },
      },
    },
  });
  res.json(categories);
});
