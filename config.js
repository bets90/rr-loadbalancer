var config = {};

config.loadbalancer = {};
config.dev = {};

config.loadbalancer.port = 3000;

// video server addresses found in case requirement
config.videoservers = [
    {
    "host" : "srv1.betselot.me",
    "port" : 3000
    }, 
    {
    "host" : "srv2.betselot.me",
    "port" : 3000
    }, 
    {
    "host" : "srv3.betselot.me",
    "port" : 3000
    }
];

// servers only used in dev environment
// (all run on local host on different ports)
config.dev.videoservers = [
    {
        "host" : "localhost",
        "port" : 3001
    },
    {
        "host" : "localhost",
        "port" : 3002
    },
    {
        "host" : "localhost",
        "port" : 3003
    }
];
module.exports = config;
