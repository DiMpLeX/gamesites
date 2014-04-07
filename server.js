// var http = require('http');
// var fs = require('fs');

// console.log('Starting..');
// var config = JSON.parse(fs.readFileSync("config.json"));
// var host = config.host;
// var port = config.port;

// var server = http.createServer(function(request, response) {
// 	console.log('Received Request: ' + request.url);
	
// 	fs.readFile("./" + request.url, function(error, data){
// 		if(error) {
// 				response.writeHead(404, {"Content-type:" : "text/plain"});
// 				response.end("Page not Found");
// 		} else {
// 				response.writeHead(200, {"Content-type:" : "text/html"});
// 				response.end(data);
// 		}
// 	});

// }).listen(port, host, function(){
// 	console.log("Listening: " + host + ":" + port);
// });

// fs.watchFile('config.json', function(){
// 	config = JSON.parse(fs.readFileSync("config.json"));
// 	host = config.host;
// 	port = config.port;
// 	server.close();
// 	server.listen(port, host, function(){
// 		console.log("Now Listening: " + host + ":" + port);
// 	});
// });

var http 	= require('http');
var fs 		= require('fs');
var express = require('express');

var app = express();

var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host;
var port = config.port;

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response){
	response.send('Hello');
}).listen(port, host);


var users = {
	"1": {
		"name": 	"James Yanzon",
		"twitter": 	"@salap"
	},
	"2": {
		"name": 	"Dimplez Beato",
		"twitter": 	"@pudee"
	}
}
app.get('/user/:id', function(request, response){
	var user = users[request.params.id];
	if(user) { 
		response.send("<a href='http://www.twitter.com/" + user.twitter + "'>Follow " + user.name + " on Twitter.com</a>");
	} else { 
		response.send('User cant be found!', 404);
	}
});

console.log('connected to express');