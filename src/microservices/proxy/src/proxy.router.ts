import { Router } from "express";
import { ProxyController } from "./proxy.controller";

export function createProxyRouter(controller: ProxyController): Router {
  const router = Router();
  router.get("/health", controller.health);
  router.all("/api/movies", controller.movies);
  router.use("/api/events", controller.events);
  router.use("/api", controller.monolith);
  return router;
}
