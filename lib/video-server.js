//video server instance
var http = require('http');
var config = require('./../config');
var dispatcher = require('httpdispatcher');

// set the port the server listens from process args 
const PORT = process.argv[2];

// handle requests 
function handleRequest(request, response){
    try {
        dispatcher.dispatch(request,response);
    } catch (error) {
        console.log(error);
    }
}
// listen to HTTP POST events to '/allocatestream'
dispatcher.onPost("/allocatestream", function (request, response) {
    var responseBody,json;
    var jsonRequest;

    jsonRequest = JSON.parse(request.body);
    
    // encode response header to JSON
    response.setHeader('Content-Type', 'application/json');
    
    // evalute request body, if it contains the right channel name, compose response body with access url 
    // otherwise compose error message and set response staus to 500
    if(jsonRequest.channelId == "svt1") {
        response.statusCode = 200;
        responseBody = {"url": "http://video1.neti.systems/svt1?token=12345", "secret": "abcdef"}
    }
    else {
        response.statusCode = 500;
        responseBody = {"error": "invalid channel name"};
    }
    json = JSON.stringify(responseBody);
    response.end(json);
});

//Create a mock video server and start it on the desired port
var startNewServerInstance = function() {
    var server = http.createServer(handleRequest);
    server.listen( PORT, function(){
        console.log("Video server listening on port %s", PORT);
    });
}();

module.exports =  startNewServerInstance;