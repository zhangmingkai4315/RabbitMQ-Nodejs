var amqp=require("amqplib");
console.log(process.argv);
var args=process.argv.slice(2);
if(args.length==0){
	console.log('Usage:node rpc_client.js 30');
	process.exit(1);
}
var num=parseInt(args[0]);
var genUUID=function(){
	return Math.random().toString();
}
var severity=args.length>0?args[0]:'info';
var q="rpc_queue";
amqp.connect('amqp://localhost')
	.then(function(connection){
	return connection.createChannel()
			.then(function(ch){
				return ch.assertQueue('',{exclusive:true})
				.then(function(q){
					var corr=genUUID();
					console.log('request fib(%d)',num);
					console.log('Waiting reply message on %s',q.queue);
					ch.consume(q.queue,function(msg){
						// console.log(msg.properties.correlationId);
						// console.log(q.queue);
						if(msg.properties.correlationId==corr){
							console.log('Got answer:%s',msg.content.toString());
							setTimeout(function(){
								connection.close();
								process.exit(0);},500);
						}
					},{noAck:true});
					ch.sendToQueue('rpc_queue',new Buffer(num.toString()),{
						correlationId:corr,
						replyTo:q.queue
					});
				});
			})

		})
	.then(null,console.warn);