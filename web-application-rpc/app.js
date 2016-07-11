var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var formatMessage=function(message,err){
  return {"Message":message||"","Error":err||""+""};
}


// amqp code start point

var amqp = require('amqplib/callback_api');
var amqpConn= null;
var pubChannel = null;

function startConnRabbitMQ(){
  amqp.connect("amqp://mike:123456@localhost", function(err, conn) {
    if(err){
      console.log("[x]Error:"+err);
      return
    }
    conn.on("error",function(err){
      if(err.message!=="Connection closing"){
        console.log("[x]Error:"+err);
        return
      }
    });
    conn.on("close",function(){
      console.log("[x]Rabbitmq is closed ,trying restart connect after 1s...")
      return setTimeout(startConnRabbitMQ,1000);
    });
    amqpConn=conn;

    console.log("[*]Rabbitmq connect is ready now!");
    startPublisher();
  });
}

function startPublisher(){
  amqpConn.createConfirmChannel(function(err,ch){
    if(err){
      console.log("[x]Error:"+err);
      return
    }
    ch.on("error",function(err){
        console.log("[x]Error:"+err);
        return
    });
    ch.on("close",function(){
      console.log("[*]Rabbitmq channel is closed")
      return
    });
    ch.assertQueue("dns_queue", {durable: false});
    pubChannel=ch;

    console.log("[*]Rabbitmq channel is ready now!")
  })
}
function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}
startConnRabbitMQ();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


app.get("/dns",function(req,res){
  console.log("Get request for dns");
});

app.post("/dns",function(req,res){
  //  res.json(req.body.domain);
   if(typeof req.body.domain==='undefined'){
     res.status(400).json({"Error":"No domain data was posted!"});
     return
   }
  //  传递给后端的rabbitmq服务器
  try {
    pubChannel.assertQueue('', {exclusive: true}, function(err, q) {
          var corr = generateUuid();
          var domain = req.body.domain;

          console.log(' [x] Requesting dns for (%s)', domain);

          pubChannel.consume(q.queue, function(msg) {
            if (msg.properties.correlationId == corr) {
              var response_data=msg.content.toString();
              console.log(' [.] Got %s',response_data);
              res.status(200).json({"Message":response_data});
            }
          }, {noAck: true});

          pubChannel.sendToQueue('dns_queue',
          new Buffer(domain),
          { correlationId: corr, replyTo: q.queue });
        });
  } catch (e) {
      console.log(e)
      res.status(500).json({"Error":e})
      return
  }
});


var server= app.listen(5000,function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('DNS App is listening at http://%s:%s', host, port);
});
