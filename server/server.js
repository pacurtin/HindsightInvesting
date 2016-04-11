/*var request = require('request');

request('http://www.google.com', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Print the google web page.
  }
})

// Load the http module to create an http server.
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello World\n");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");*/

var express = require('express');
var request = require('request');
var cors = require('cors');
var app = express();
//var fs = require("fs");
//var __dirname = 'C:\\Users\\padraig.curtin\\Projects\\HindsightInvesting\\server';

/*app.get('/listUsers', function (req, res) {
  fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
    console.log( data );
    res.end( data );
  });
})*/

app.use(cors({origin: 'http://localhost:3000'}));

app.get('/listUsers', function (req, res) {
  request('http://ichart.finance.yahoo.com/table.csv?s=GE&g=w', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Print the stock data page.
      res.end( body );
    }
  })
})

var server = app.listen(8000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
