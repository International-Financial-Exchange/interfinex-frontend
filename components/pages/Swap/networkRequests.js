import { getRequest } from "../../../utils";

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
