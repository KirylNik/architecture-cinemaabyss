import { Router } from "express";
import { EventsController } from "./events.controller";

export function createEventsRouter(controller: EventsController): Router {
  const router = Router();
  router.get("/api/events/health", controller.health);
  router.post("/api/events/movie", controller.createMovieEvent);
  router.post("/api/events/user", controller.createUserEvent);
  router.post("/api/events/payment", controller.createPaymentEvent);
  return router;
}
