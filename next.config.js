const ENV = require("./.env.json");

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
    publicRuntimeConfig: {
        ETH_NODE_URL: ENV.ethNodeUrls[process.env.NETWORK],
        SERVER_URL: ENV.serverUrls[process.env.NETWORK],
    },
});