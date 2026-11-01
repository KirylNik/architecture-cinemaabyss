import { Request, Response } from "express";
import { EventProducer } from "./event-producer";

type EventType = "movie" | "user" | "payment";

export class EventsController {
  constructor(private readonly producer: EventProducer) {}

  public health = (_req: Request, res: Response): void => {
    res.json({ status: true });
  };

  public createMovieEvent = (req: Request, res: Response): Promise<void> => {
    const { movie_id, user_id, action } = req.body;
    return this.publish(res, "movie", String(user_id ?? movie_id), `movie-${movie_id}-${action}`, req.body);
  };

  public createUserEvent = (req: Request, res: Response): Promise<void> => {
    const { user_id, action } = req.body;
    return this.publish(res, "user", String(user_id), `user-${user_id}-${action}`, req.body);
  };

  public createPaymentEvent = (req: Request, res: Response): Promise<void> => {
    const { payment_id, user_id, status } = req.body;
    return this.publish(res, "payment", String(user_id), `payment-${payment_id}-${status}`, req.body);
  };

  private async publish(res: Response, type: EventType, key: string, id: string, payload: Record<string, unknown>): Promise<void> {
    const event = { id, type, timestamp: payload.timestamp ?? new Date().toISOString(), payload };
    const { partition, offset } = await this.producer.send(`${type}-events`, key, event);
    res.status(201).json({ status: "success", partition, offset, event });
  }
}
