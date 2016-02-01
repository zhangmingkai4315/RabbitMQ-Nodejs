var amqp=require("amqplib");
amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		var q="task_queue";
		var msg=process.argv.slice(2).join('')||"hello world";
		// console.log(msg)
		var ok=ch.assertQueue(q,{durable:true});
		return ok.then(function(_qok){
			ch.sendToQueue(q,new Buffer(msg),{persistent:true});
			console.log("[x] Send '%s'",msg);
			return ch.close();
		}).then(function(){
			connection.close();
			process.exit(0);
		});
	})
}).then(null,console.warn);