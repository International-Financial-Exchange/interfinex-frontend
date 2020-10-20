import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig();

export const ETH_NODE_URL = publicRuntimeConfig.ETH_NODE_URL;