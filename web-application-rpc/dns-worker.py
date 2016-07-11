#!/usr/bin/env python
import pika
import json

import dns.resolver #import the module
myResolver = dns.resolver.Resolver() #create a new instance named 'myResolver'

parameters = pika.URLParameters('amqp://mike:123456@localhost')
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

channel.queue_declare(queue='dns_queue')


def getDnsResponse(domain):
    myAnswers = myResolver.query(domain, "A")
    return myAnswers[0]

def on_request(ch, method, props, body):
    domain = str(body)

    print(" [.] DNS request:(%s)" % domain)
    response = getDnsResponse(domain)

    ch.basic_publish(exchange='',
                     routing_key=props.reply_to,
                     properties=pika.BasicProperties(correlation_id = \
                                                         props.correlation_id),
                     body=str(response))
    ch.basic_ack(delivery_tag = method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(on_request, queue='dns_queue')

print(" [x] Awaiting RPC requests")
channel.start_consuming()
