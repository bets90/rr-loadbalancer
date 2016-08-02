var http = require('http');
var request = require('request-promise');
var config = require('./../config');
var environment = process.env.NODE_ENV || 'development';

var roundRobinIndex = 0;
var count = 0;

// add local backend video servers in dev environment 
// otherwise use producion server addresses given in the question
var servers = (environment === "development")  ? servers = config.dev.videoservers : config.videoservers ;

var  finalErrorMessage= {
    'error' : 'no or bad response',
    'details' : 'All servers contacted but none could give successful response'
}

var  inValidRequestErrorMessage= {
    'error' : 'bad request',
    'details' : 'bad request JSON could not be parsed, invalid format'
}

//picks the next server from available servers in round robin fashion and returns its url
function getNextServerRR() {
    url = "http://" + servers[roundRobinIndex].host + ":" +servers[roundRobinIndex].port.toString() + '/allocatestream';
    console.log("current url " + url);
    roundRobinIndex = (roundRobinIndex + 1) % servers.length;
    return url;
}


// encode response from video servers to a response-to-client: remove the 'secret' attribute
function processVideoServerResponse(responseBody) {
    var response;
    if(responseBody.url != null && responseBody.secret != null) {
        response =  {
            url : responseBody.url
        }
    } else {
        response = null;
    }
    return response;

}
// Configure the request options and headers
function composeRequestOptions (data) {
    var headers = {
        'Content-Type': 'application/json'
    };
    
    var options = {
        url: getNextServerRR(),
        method: 'POST',
        headers: headers,
        json : data,
        timeout: 1000,  // 1 second timeout
        resolveWithFullResponse: true  // get all response components not only the body
    }
    return options;
}

//process requests from clients and pass it to one of the backend servers
function passRequest(data, res) {
    var responseToClient;
    // prepare all required request options
    var options = composeRequestOptions(data);
    // make request to one of the video servers and wait promise to be resolved
    request(options)
        .then( function (response) {
            // if HTTP OK is responded
            if (response.statusCode == 200) {
                //validate  body of video server's response
                responseToClient = processVideoServerResponse(response.body);
                // if the response body  (from the video servers),
                // contains the desired field, mark the response (now to the client) as ok (200)
                // otherwise mark response's code to 500,
                if (responseToClient.url != null) {
                    res.statusCode = 200;
                }
                else
                    res.statusCode = 500;
                // if video server responds with 500 mark response-to-client's status code to 500
                // NOTE: status code may change when the function runs again trying another server
            } else if(response.statusCode == 500) {
                res.statusCode = 500;
            }
        }).catch(
        function(error) {
            console.log("Error happened " + error);
            responseToClient = error;
            res.statusCode = 500;
        }
        // this executes after promise resolves regardless of error or successful response
        // evaluate response to client's status code as a means of determining
        // whether to try again or send the response to client
    ).finally(
        function () {
            count++;
            // success, send response to client and return
            if(res.statusCode == 200) {
                count = 0;
                return res.end(JSON.stringify(responseToClient));
            }
            // this round is not successful but there are other other video servers to try, recursive call
            else if(res.statusCode == 500 && count < config.videoservers.length) {
                console.log("trying another server " + count);
                return passRequest(data, res);
            }
            // all servers tried but no successful response, send 500 50 client
            else
            {
                res.statusCode = 500;
                count = 0;
                return res.end(JSON.stringify(finalErrorMessage));
            }
        }
    );
}

//handle requests coming from clients
function handleRequest(req, res){
    try {
        // if the request is POST and has the right URL pass to next function to process further
        if(req.method === 'POST' && req.url === '/allocatestream') {
            var  buffer = '';
            var requestBody;
            //as data comes read the buffer and store to jsonString
            req.on('data', function(data) {
                buffer += data;
            });

            req.on('end', function () {
                try {
                    requestBody = JSON.parse(buffer);
                }
                catch (ex) {
                    requestBody = "";
                }
                //response will always be encoded as json
                res.setHeader('Content-Type', 'application/json');
               // first check if request is parsed correctly
                if(requestBody != "") {
                    //passRequest takes request body and the response
                    passRequest(requestBody, res);
                }
                // return 400 and error message for malformed or null request body
                else {
                    res.statusCode = 400;
                    res.end(JSON.stringify(inValidRequestErrorMessage));
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

//creates and starts load balancer HTTP server
var startLoadBalancer =  function() {
    var server = http.createServer(handleRequest);
    server.listen(3000, function(){
        console.log("Load balancer listening on: http://localhost:%s", config.loadbalancer.port);
    });

};

module.exports = startLoadBalancer;