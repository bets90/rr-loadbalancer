var config = require('../config');
var fork = require('child_process').fork;

//read video server instances and their parameters from config file
var servers = config.dev.videoservers;

//spawn a new child process for each of the video server instances found in the config
var startAll =  function() {
    servers.forEach(function(server)
    {
        var args = [server.port];
        fork('./lib/video-server',args );
    });
};

module.exports =  startAll;
