import { getRequest } from "../../../utils/network";

export const getHistoricalTrades = ({ from, to, exchangeContract, limit, user }) => {
    return getRequest("/swap/tradesHistory", { from, to, exchangeContract, limit, user });
};

export const getCandles = async ({ from, to, baseTokenAddress, assetTokenAddress, timeframe, limit }) => {
    let lastFetchedCandle;
    const candles = [];
    while (true) {
        console.log("/swap/candles",  { from: lastFetchedCandle?.openTimestamp ?? from, to, baseTokenAddress, assetTokenAddress, limit, timeframe })
        const fetchedCandles = await getRequest(
            "/swap/candles", 
            { from: lastFetchedCandle?.openTimestamp ?? from, to, baseTokenAddress, assetTokenAddress, limit, timeframe }
        );
            
        candles.push(...fetchedCandles);
        if (fetchedCandles.last()) lastFetchedCandle = fetchedCandles.last();
        else break;
    }

    return candles;
};

export const getFundingHistory = ({ from, to, marginMarketContract, limit, user }) => {
    return getRequest("/marginMarket/fundingHistory", { from, to, marginMarketContract, limit, user });
};

export const getMarginPositions = ({ marginMarketContract, limit, user, offset }) => {
    return getRequest("/marginMarket/positions", { marginMarketContract, limit, user, offset });
};