import express from "express";
import { MoviesMigration } from "./movies-migration";
import { ProxyController } from "./proxy.controller";
import { createProxyRouter } from "./proxy.router";

const migration = new MoviesMigration(
  process.env.GRADUAL_MIGRATION === "true",
  Number(process.env.MOVIES_MIGRATION_PERCENT ?? 0),
);

const controller = new ProxyController(
  {
    monolith: process.env.MONOLITH_URL ?? "http://monolith:8080",
    movies: process.env.MOVIES_SERVICE_URL ?? "http://movies-service:8081",
    events: process.env.EVENTS_SERVICE_URL ?? "http://events-service:8082",
  },
  migration,
);

const app = express();
app.use(express.raw({ type: "*/*" }));
app.use(createProxyRouter(controller));

const port = Number(process.env.PORT ?? 8000);
app.listen(port, () => console.log(`proxy-service listening on port ${port}`));
