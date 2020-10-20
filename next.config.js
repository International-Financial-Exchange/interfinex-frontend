const ENV = require("./.env.json");

module.exports = {
    publicRuntimeConfig: {
        ETH_NODE_URL: ENV.ethNodeUrls[process.env.NETWORK],
    },
}