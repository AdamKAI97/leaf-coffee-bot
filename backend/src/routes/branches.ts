import { Router } from "express";
import { prisma } from "../prisma";

export const branchesRouter = Router();

branchesRouter.get("/", async (_req, res) => {
  const branches = await prisma.branch.findMany({ where: { isActive: true } });
  res.json(branches);
});
