#!/usr/bin/env python
import pika
import json

import dns.resolver #import the module
myResolver = dns.resolver.Resolver() #create a new instance named 'myResolver'





parameters = pika.URLParameters('amqp://mike:123456@localhost')
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

channel.exchange_declare(exchange='dns',
                         type='fanout')

result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue

channel.queue_bind(exchange='dns',
                   queue=queue_name)

print(' [*] Waiting for dns request. To exit press CTRL+C')

def callback(ch, method, properties, body):
    # print body
    request_domain=json.loads(body)["domain"]
    myAnswers = myResolver.query(request_domain, "A") #Lookup the 'A' record(s) for google.com
    for rdata in myAnswers: #for each response
        print(" [x] %r" % rdata)

channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)

channel.start_consuming()
