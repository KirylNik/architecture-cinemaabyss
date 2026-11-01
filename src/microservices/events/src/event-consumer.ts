import { Kafka } from "kafkajs";

export class EventConsumer {
  constructor(private readonly kafka: Kafka) {}

  public async start(topic: string, groupId: string): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ partition, message }) => {
        console.log(`Processed ${topic} event: partition=${partition} offset=${message.offset} key=${message.key} value=${message.value}`);
      },
    });
  }
}
