'use strict';

const crypto = require('node:crypto');
const kfk = require('kafkajs');

const topic = 'topic-test';
const groupId = 'group-test';
const clientId = `consumer-${crypto.randomUUID()}`;

const kafka = new kfk.Kafka({
    brokers: ['localhost:9092'],
    clientId,
});

const retry = {
    maxRetryTime: 5 * 60 * 1000, /* Allow retries w/ a timeout of 5 min. */
    initialRetryTime: 200,
    factor: 0,
    multiplier: 2,
    retries: 10,
    restartOnFailure: async (error) => {
        kafka.logger().info('Consumer exhausts all retries', {error});
        return true; /* Resolving true will restart consumer */
    }
};

const consumer = kafka.consumer({groupId, retry});

const consume = async () => {
    await consumer.connect();
    await consumer.subscribe({topic, fromBeginning: true, });
    await consumer.run({
        eachMessage: ({topic, partition, message}) => {
            console.log(JSON.stringify(message));
            kafka.logger().info('Message consumed', {
                topic,
                partition,
                key: message.key.toString(),
                value: message.value.toString(),
                offset: message.offset,
            });

            /* Comment the error if you want to auto commit the offset */
            throw new kfk.KafkaJSError('Custom failed to process message', {retriable: true});
        }
    });
};

consume().catch(async (error) => {
    await consumer.disconnect();
    kafka.logger().error(error.message, {stack: error.stack});
});

const sigs = ['SIGTERM', 'SIGINT'];
sigs.forEach(type => {
    process.once(type, async () => {
        kafka.logger().info('Gracefully shutting down');
        await consumer.disconnect();
        process.exit(0);
    });
});
