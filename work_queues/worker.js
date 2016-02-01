var amqp=require("amqplib");
amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		var q="task_queue";
		var ok=ch.assertQueue(q,{durable:true});
		ch.prefetch(1);		
		ok=ok.then(function(_qok){
			return ch.consume(q,function(msg){
			var secs=msg.content.toString().split('.').length-1;
			console.log("Receiving '%s'",msg.content.toString());
			setTimeout(function(){
				console.log('[x] Done');
				ch.ack(msg);
			},secs*1000);
			},{noAck:false});
		});
		return ok.then(function(_consumeOk){
			console.log("[x] Waiting for message in '%s'",q);
		})
	})
}).then(null,console.warn);