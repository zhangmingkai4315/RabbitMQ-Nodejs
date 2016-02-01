var amqp=require("amqplib");
amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		var ex="logs";
		ch.assertExchange(ex,'fanout',{durable:true});
		var ok=ch.assertQueue('',{exclusive:true})
		  .then(function(q){
			console.log("[x]Waiting for message in '%s' ",q.queue);
			return ch.bindQueue(q.queue,ex,'');
		}).then(function(q){
			return ch.consume(q.queue,function(msg){
				console.log("[x]Receiving message:'%s'",msg.content.toString());
			},{noAck:true});
		});
	})
}).then(null,console.warn);
