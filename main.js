var express = require("express");
var main = express();
var http = require("http").Server(main);
var io = require("socket.io")(http);
var mongoose = require("mongoose");

mongoose.connect(process.env.PLAYGROUND_DB, {useNewUrlParser:true});
var db = mongoose.connection;

db.once("open", function() {
  console.log("DB Connected!");
});
db.on("error", function(err) {
  console.log("DB ERROR : " + err);
});

main.set("view engine", "ejs");
main.use(express.static(__dirname + "/public"));

main.get("/", function(req, res) {
  res.redirect("/index");
});
main.get("/index", function(req, res) {
  res.render("index");
});
main.get("/index/chat1", function(req, res) {
  res.render("chat1");
});
main.get("/index/chat2", function(req, res) {
  res.render("chat2");
});

var ns1 = io.of("/chat1");
var ns2 = io.of("/chat2");

var chat1_name = [];
var chat1_id = [];
var chat2_name = [];
var chat2_id = [];

var count1 = 1;
ns1.on("connection", function(socket) {
  console.log("chat1 user connected : " + socket.id);
  var name = "user" + count1++;
  chat1_name.push(name);
  chat1_id.push(socket.id);
  ns1.to(socket.id).emit("change name", name);
  ns1.to(socket.id).emit("welcome message", name);
  ns1.emit("in message", name);
  socket.on("disconnect", function() {
    for(var i = 0; i < chat1_id.length; i++) {
      if(chat1_id[i] == socket.id) {
        chat1_name.splice(i, 1);
        chat1_id.splice(i, 1);
      }
    }
    ns1.emit("out message", name);
    console.log("chat1 user disconnected : " + socket.id);
  });
  socket.on("send message", function(name, text) {
    var msg = name + " : " + text;
    console.log(msg);
    ns1.emit("receive message", msg);
  });
  socket.on("find id", function(name) {
    for(var i = 0; i < chat1_name.length; i++) {
      if(chat1_name[i] == name) {
        ns1.emit("send id", chat1_id[i]);
      }
    }
  });
});
var count2 = 1;
ns2.on("connection", function(socket) {
  console.log("chat2 user connected : " + socket.id);
  var name = "user" + count2++;
  chat2_name.push(name);
  chat2_id.push(socket.id);
  ns2.to(socket.id).emit("change name", name);
  ns2.to(socket.id).emit("welcome message", name);
  ns2.emit("in message", name);
  socket.on("disconnect", function() {
    for(var i = 0; i < chat2_id.length; i++) {
      if(chat2_id[i] == socket.id) {
        chat2_name.splice(i, 1);
        chat2_id.splice(i, 1);
      }
    }
    ns2.emit("out message", name);
    console.log("chat2 user disconnected : " + socket.id);
  });
  socket.on("send message", function(name, text) {
    var msg = name + " : " + text;
    console.log(msg);
    ns2.emit("receive message", msg);
  });
  socket.on("find id", function(name) {
    for(var i = 0; i < chat2_name.length; i++) {
      if(chat2_name[i] == name) {
        ns2.emit("send id", chat2_id[i]);
      }
    }
  });
});

var port = process.env.PORT || 8000;

http.listen(port, function() {
  console.log("Server On!");
});
