import express from "express";
import cors from "cors";
import { branchesRouter } from "./routes/branches";
import { menuRouter } from "./routes/menu";
import { internalSeedRouter } from "./routes/internalSeed";
import { tableCallsRouter } from "./routes/tableCalls";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/branches", branchesRouter);
app.use("/api/menu", menuRouter);
app.use("/api/table-calls", tableCallsRouter);
app.use("/internal/seed", internalSeedRouter);

const port = process.env.PORT ?? 3000;

async function start() {
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const { bot } = await import("./bot");
    const webhookBase = process.env.WEBHOOK_BASE_URL ?? process.env.RENDER_EXTERNAL_URL;
    if (webhookBase) {
      const webhookPath = `/bot${process.env.TELEGRAM_BOT_TOKEN}`;
      app.use(bot.webhookCallback(webhookPath));
      await bot.telegram.setWebhook(`${webhookBase}${webhookPath}`);
      console.log("Telegram webhook set");
    } else {
      console.warn("WEBHOOK_BASE_URL/RENDER_EXTERNAL_URL not set, skipping webhook setup");
    }
  } else {
    console.warn("TELEGRAM_BOT_TOKEN not set, bot disabled");
  }

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

start();
