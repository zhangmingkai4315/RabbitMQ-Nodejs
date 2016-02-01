var amqp=require("amqplib");
var args=process.argv.slice(2);
// console.log(args);
var msg=args.slice(1).join('')||'hello world';
var severity=args.length>0?args[0]:'info';

amqp.connect('amqp://localhost').then(function(connection){
	return connection.createChannel().then(function(ch){
		var ex="topic_logs";

			var ok=ch.assertExchange(ex,'topic',{durable:true});
		return ok.then(function(_qok){
			// console.log(severity);
			ch.publish(ex,severity,new Buffer(msg));
			console.log("[x] Send '%s'",msg);
			return ch.close();
		}).then(function(){
			connection.close();
			process.exit(0);
		});
	})
}).then(null,console.warn);