import express from "express";
import { Kafka } from "kafkajs";
import { EventConsumer } from "./event-consumer";
import { EventProducer } from "./event-producer";
import { EventsController } from "./events.controller";
import { createEventsRouter } from "./events.router";

const kafka = new Kafka({
  clientId: "events-service",
  brokers: (process.env.KAFKA_BROKERS ?? "kafka:9092").split(","),
  retry: { retries: 10 },
});

const producer = new EventProducer(kafka);
const consumer = new EventConsumer(kafka);

async function main(): Promise<void> {
  await producer.connect();
  for (const type of ["movie", "user", "payment"]) {
    await consumer.start(`${type}-events`, `events-service-${type}`);
  }

  const app = express();
  app.use(express.json());
  app.use(createEventsRouter(new EventsController(producer)));

  const port = Number(process.env.PORT ?? 8082);
  app.listen(port, () => console.log(`events-service listening on port ${port}`));
}

main();
