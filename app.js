// Javascript File
// AUTHOR:   LaoSi
// FILE:     app.js
// 2013 @laosiaudi All rights reserved
// CREATED:  2014-01-20 22:02:19
// MODIFIED: 2014-01-25 14:57:17
var onlinelist = {};
var socketset = {};
var index = 0;
var express = require('express')
  , app =express()
  ,server = app.listen(8888)
  , io = require('socket.io').listen(server);
var jade = require('jade');
app.use(express.static(__dirname+'/public'));
app.use(express.urlencoded());
app.use(express.json());
app.get('/', function (req, res) {
  console.log("in");
  res.sendfile(__dirname + '/login.html');
});

app.post('/',function(req,res){

  var name = req.param('name');
  var pass = req.param('pass');
  console.log(name);
  //res.sendfile(__dirname+'/index.html');
  res.render(__dirname+'/index.jade',{username:name});
});
io.sockets.on('connection', function (socket) {
  var address = socket.handshake.address;
  var addressSet = new Array();
  addressSet[0] = address.address;
  addressSet[1] = address.port;
  //socket.emit('news', { onlinelist: onlinelist });
  socket.on('group talk', function (data) {
      //socket.emit('news',{hello:'received'});
      console.log(data);
      socket.broadcast.emit('group talked',data);
    });
  socket.on('set username',function(name){
    var uname = name['username'];
    socket.set('nickname',uname,function(){
      socket.emit('ready',{onlinelist:onlinelist});
      onlinelist[uname] = addressSet;
      socketset[uname] = socket;
      socket.broadcast.emit('update',{data:uname,address:addressSet});
    });
  });
  socket.on('disconnect',function(){
    socket.get('nickname',function(err,dename){
      console.log('dis---'+dename);
      var deindex = -1;
      for (var key in onlinelist){
        if (key == dename){
          delete onlinelist[key];
          break;
        }
      }
      io.sockets.emit('news',{onlinelist:onlinelist});
    });
  });
  socket.on('addroom',function(data){
    var roomname = data['roomn'];
    var ps = data['ps'];
    var pr = data['pr'];
    socket.join(roomname);
    var prsocket = socketset[pr];
    console.log(pr);
    prsocket.join(roomname);
    prsocket.emit('addedroom',{ps:ps,roomname:roomname});
  });
  socket.on('roomconnected',function(data){
    var roomname = data['roomname'];
    socket.broadcast.to(roomname).emit('roomfinished');
  });
  socket.on('roomchat',function(data){
    var roomname = data['roomname'];
    socket.broadcast.to(roomname).emit('roommsg',{data:data});
  });
});
