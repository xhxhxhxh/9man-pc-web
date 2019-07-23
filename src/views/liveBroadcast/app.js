var express = require('express');
var app = express();
var http = require('http').Server(app);
var router = express.Router();
var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
        socket.broadcast.emit('chat message', msg);
    });
});

http.listen(3000,function () {
    console.log('服务已启动');
});
