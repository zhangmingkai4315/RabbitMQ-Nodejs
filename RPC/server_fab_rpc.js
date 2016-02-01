var amqp=require("amqplib");
var fibonacci=function(n){
	if(n==0||n==1){
		return n;
	}else{
		return fibonacci(n-1)+fibonacci(n-2);
	}
}
var q="rpc_queue";
amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		return ch.assertQueue(q,{durable:true})
			.then(function(){
				ch.prefetch(1);
				console.log('[x] Waiting RPC request');
				ch.consume(q,function reply(msg){
						console.log(msg);
						var n=parseInt(msg.content.toString());
						var r=fibonacci(n);
						console.log(r);
						ch.sendToQueue(msg.properties.replyTo,new Buffer(r.toString()),{
							correlationId:msg.properties.correlationId
						});
						ch.ack(msg);
					});
			})
		})
}).then(null,console.warn);
