## This repository aims to demonstrate how to work with Kafka's consumer retries using kafkajs

### How to:
##### 1. Run kafka broker:
```sh
make start
```
##### 2. Run consumer:
```sh
make consume
```
The consumer is configured to throw an `KafkaJSError` which will handle the retries based on the retry policy defined during consumer definition through `retry` parameter
##### 3. Produce a single message:
```sh
make produce
```
This command will send a single message and should exit with status code `0`.

### The expected behavior
The consumer should receive the same message 10 times.
1. The first attempt after `200ms`
2. The second attempt after `400ms`
3. Basically, it will double the time until achieve 10 attempts (`800ms` -> `1600ms` -> `3200ms` -> `6400ms` -> `12800ms` -> `25600ms` -> `51200ms` -> `102400ms`)
4. Restart the consumer automatically and consume the messages again with the same retry policy
