'use strict';

const crypto = require('node:crypto');
const kfk = require('kafkajs');

const topic = 'topic-test';
const clientId = `producer-${crypto.randomUUID()}`;

const kafka = new kfk.Kafka({
    brokers: ['localhost:9092'],
    clientId,
});

const producer = kafka.producer();

const produce = async () => {
    await producer.connect();
    await producer.send({
        topic,
        messages: [{
            key: crypto.randomUUID(),
            value: JSON.stringify({foo: 'bar', uuid: crypto.randomUUID()})
        }]
    });

    kafka.logger().info('Message sent');
    await producer.disconnect();
    process.exit(0);
};

produce().catch((error) => {
    kafka.logger().error(error.message, {stack: error.stack});
});
