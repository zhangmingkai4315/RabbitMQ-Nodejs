var amqp=require("amqplib");
var args=process.argv.slice(2);

if(args.length==0){
	console.log(args);
	return ;
}
amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		var ex="topic_logs";
		ch.assertExchange(ex,'topic',{durable:true});
		var ok=ch.assertQueue('',{exclusive:true})
		  .then(function(q){
				console.log("[x]Waiting for message in '%s' ",q.queue);
				var queuePromises=args.forEach(function(key){
				 console.log(key);
				 ch.bindQueue(q.queue,ex,key);
				});
				return ch;
			})
		  .then(function(q){
			 ch.consume(q.queue,function(msg){
						console.log("[x]Receiving message:'%s'",msg.content.toString());
					},{noAck:true});
			})
	})
}).then(null,console.warn);
