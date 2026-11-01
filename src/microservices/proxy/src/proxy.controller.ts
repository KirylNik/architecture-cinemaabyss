import { Request, Response } from "express";
import { MoviesMigration } from "./movies-migration";

export interface Upstreams {
  monolith: string;
  movies: string;
  events: string;
}

export class ProxyController {
  constructor(
    private readonly upstreams: Upstreams,
    private readonly migration: MoviesMigration,
  ) {}

  public health = (_req: Request, res: Response): void => {
    res.json({ status: true });
  };

  public movies = async (req: Request, res: Response): Promise<void> => {
    if (this.migration.isRoutedToMoviesService(req.get("x-user-id"))) {
      try {
        await this.forward(req, res, this.upstreams.movies);
        return;
      } catch {
        console.log("movies-service is unavailable, falling back to monolith");
      }
    }
    await this.forward(req, res, this.upstreams.monolith);
  };

  public events = (req: Request, res: Response): Promise<void> => this.forward(req, res, this.upstreams.events);

  public monolith = (req: Request, res: Response): Promise<void> => this.forward(req, res, this.upstreams.monolith);

  private async forward(req: Request, res: Response, baseUrl: string): Promise<void> {
    const upstream = await fetch(baseUrl + req.originalUrl, {
      method: req.method,
      headers: { "content-type": req.get("content-type") ?? "application/json" },
      body: Buffer.isBuffer(req.body) ? new Uint8Array(req.body) : undefined,
    });
    console.log(`${req.method} ${req.originalUrl} -> ${baseUrl} ${upstream.status}`);
    res.status(upstream.status).type(upstream.headers.get("content-type") ?? "application/json");
    res.send(Buffer.from(await upstream.arrayBuffer()));
  }
}
