// Javascript File
// AUTHOR:   LaoSi
// FILE:     active.js
// 2013 @laosiaudi All rights reserved
// CREATED:  2014-01-25 15:45:51
// MODIFIED: 2014-01-25 15:46:53

var socket = io.connect('http://localhost');
var userlist;
var currentpeer;
var currentroom;
  socket.on('connect',function(){
    var name = $('username').innerHTML;
    socket.emit('set username',{username:name});
    socket.on('ready',function(data){
      var contentdiv = $("content");
      contentdiv.update('Connected!');
      var onlinelist = data["onlinelist"];
      userlist = onlinelist;
      var content = 'This is the userList:</br>';
      for (var key in onlinelist){
        content += '<p class="username" onclick="p2pconnect(this)">' + key + '</p>';
      }
      $('userlist').update(content);
    });
  });
  socket.on('news', function (data) {
    console.log(data);
    var onlinelist = data["onlinelist"];
    userlist = onlinelist;
    var content = 'This is the userList:</br>';
    var usrname = $('username').innerHTML;
    for (var key in onlinelist){
      if (key == usrname)
        continue;
      content +=  '<p class="username" onclick="p2pconnect(this)">'+key + '</p>';
    }
    $('userlist').update(content);
    var gg = document.getElementById("content");
        //gg.innerHTML = data["hello"];
  });
  socket.on("disconnect",function(){
    var gg = document.getElementById("content");
    gg.innerHTML = "leave";
  });
  socket.on('update',function(data){
    var content = $('content').innerHTML;
    content += '</br>' + data['data'] + ' Login now!';
    //alert(data['data']);
    $('content').update(content);
    var ulist = $('userlist').innerHTML;
    ulist +=  '<p class="username" onclick="p2pconnect(this)">' + data['data'] + '</p></br>';
    $('userlist').update(ulist);
    userlist[data['data']] = data['address'];
  });
  socket.on('group talked',function(data){
    //alert(data);
    var text = data['msg'];
    var urname = data['uname'];
    var content = $('content').innerHTML;
    content += '</br>' + urname + '  ' + new Date().toLocaleString() + '</br>' + text + '</br>';
    $('content').update(content);
  });
  socket.on('addedroom',function(data){
    var roomname = data['roomname'];
    var ps = data['ps'];
    currentpeer = ps;
    currentroom = roomname;
    var title = 'from room:' + roomname + ' peer: ' + ps +' connected!';
    var content = $('content').innerHTML;
    content += '</br>' + title;
    $('content').update(content);
    socket.emit('roomconnected',{roomname:roomname});
    var ul = $('pchat');
    var child = ul.childNodes;
    if (child.length == 1)
      ul.removeChild(child[0]);
    var newdiv = document.createElement('div');
    newdiv.update('<input id = "pcontent" type="text" name="pchatcontent"><button id="psubmit" type="submit" onclick="submitp2p()">Submit');
    ul.appendChild(newdiv);
  });
  socket.on('roomfinished',function(){
    var ul = $('pchat');
    var child = ul.childNodes;
    if (child.length ==1)
      ul.removeChild(child[0]);
    var newdiv = document.createElement('div');
    newdiv.update('<input id = "pcontent" type="text" name="pchatcontent"><button id="psubmit" type="submit" onclick="submitp2p()">Submit');
    ul.appendChild(newdiv);
  });
  socket.on('roommsg',function(data){
    var msg = data['data'];
    var text = msg['content'];
    var sender = msg['user'];
    var content = $('content').innerHTML;
    var roomname = msg['roomname'];
    content += roomname + '#' + sender + '=> ' + new Date().toLocaleString() + '</br>' + text + '</br>';
    $('content').update(content);
  });
  function submit(){
   var urname = $("username").innerHTML;
   var text = $('input').value;
   if (text == '')
     alert('Empty message!');
   else{
    $('input').value='';
    var content = $('content').innerHTML;
    content += '</br>' + urname + '  ' + new Date().toLocaleString() + '</br>' + text;
    $('content').update(content);
    socket.emit('group talk',{uname:urname,msg:text});
    }
  }
  function p2pconnect(plabel){
    var uname = plabel.innerHTML;
    currentpeer = uname;
    var ownname = $("username").innerHTML;
    var roomn = $('roomname').value;
    currentroom = roomn;
    if (roomn == '')
      alert('Please set room name!');
    else{
      $('roomname').value = '';
      var room = 'room#' + ownname + '#' + uname;
      socket.emit('addroom',{roomn:roomn,ps:ownname,pr:uname});
      var content = $('content').innerHTML;
      content += '</br>You have joined a new room: ' + roomn + ' peer:' + uname + '</br>';
      $('content').update(content);
    }
  }
  function submitp2p(){
    var urname = $("username").innerHTML;
    var text = $("pcontent").value
    $("pcontent").value = '';
    var roomname = currentroom;
    socket.emit('roomchat',{roomname:roomname,user:urname,content:text});
    var content = $('content').innerHTML;
    content += roomname + '#' + urname + '=> ' + new Date().toLocaleString() + '</br>' + text + '</br>';
    $('content').update(content);
  }
