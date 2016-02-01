var amqp=require("amqplib");
amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		var ex="logs";
		var msg="hello world";
		// console.log(msg)
			var ok=ch.assertExchange(ex,'fanout',{durable:true});
		return ok.then(function(_qok){
			ch.publish(ex,'',new Buffer(msg));
			console.log("[x] Send '%s'",msg);
			return ch.close();
		}).then(function(){
			connection.close();
			process.exit(0);
		});
	})
}).then(null,console.warn);