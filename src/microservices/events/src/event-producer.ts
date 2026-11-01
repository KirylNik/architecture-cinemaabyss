import { Kafka, Partitioners, Producer } from "kafkajs";

export interface DeliveryReport {
  partition: number;
  offset: number;
}

export class EventProducer {
  private readonly producer: Producer;

  constructor(kafka: Kafka) {
    this.producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  }

  public connect(): Promise<void> {
    return this.producer.connect();
  }

  public async send(topic: string, key: string, event: object): Promise<DeliveryReport> {
    const [record] = await this.producer.send({
      topic,
      acks: 1,
      messages: [{ key, value: JSON.stringify(event) }],
    });
    return { partition: record.partition, offset: Number(record.baseOffset) };
  }
}
