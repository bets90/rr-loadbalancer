# Round Robin Load Balancer for HTTP Video Servers

This program load balances among three backend video-url servers in round robin fashion.

to run follow the following steps;

1. run `npm install` on project root folder
2. run `node index.js`
 
Note that the video backend servers' address can  be changed by editing the config.js file. change to localhost for running the servers locally.

Set the `NODE_ENV` environment variable to `development` in order to use local video servers otherwise production backend servers in config.js will be used.

run `npm test` on project root folder in order to run the test.
 
Betselot Hailu
2016