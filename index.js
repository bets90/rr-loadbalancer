var loadBalancer = require('./lib/loadbalancer');
var videoServerCluster = require('./lib/video-servers-launcher');

// app entry file: launches the load balancer and the backend video servers
loadBalancer();

// start local video server only on dev environment
if(process.env.NODE_ENV === 'development')
videoServerCluster();

