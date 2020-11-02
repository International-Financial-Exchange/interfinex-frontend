import { Chart } from "../../core/Chart";
import { useEffect, useContext, useState } from "react";
import { getCandles } from "./networkRequests";
import { TokenPairContext } from "../../../context/TokenPair";
import { TIMEFRAMES } from "../../../utils";
import { SwapContext } from "./Swap";

export const TradeInfoChart = () => {
    const CANDLES_TO_FETCH = [
        { timeframe: TIMEFRAMES["1m"], range: TIMEFRAMES["1h"], name: "1H" },
        { timeframe: TIMEFRAMES["15m"], range: TIMEFRAMES["1d"], name: "24H" },
        { timeframe: TIMEFRAMES["15m"], range: TIMEFRAMES["1w"], name: "1W" },
        { timeframe: TIMEFRAMES["4h"], range: Date.now(), name: "ALL" },
    ];

    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { exchangeAssetTokenBalance, exchangeBaseTokenBalance } = useContext(SwapContext);
    const [candles, setCandles] = useState({
        ["1H"]: [],
        ["24H"]: [],
        ["1W"]: [],
        ["ALL"]: [],
    });

    useEffect(() => {
        if (assetToken && baseToken) {
            CANDLES_TO_FETCH.map(({ timeframe, range, name }) => {
                getCandles({ 
                    timeframe,
                    from: Date.now() - range,
                    to: Date.now(),
                    limit: 500,
                    assetTokenAddress: assetToken.address,
                    baseTokenAddress: baseToken.address,
                })
                    .then(candles => {
                        setCandles(old => ({
                            ...old,
                            [name]: candles.map(({ openTimestamp, close }) => ({ x: openTimestamp, y: close.toFixed(6) })),
                        }))
                    })
                    .catch(e => console.log(e));
            })
        }
    }, [assetToken, baseToken]);

    return (
        <Chart
            options={[
                { 
                    label: "Price", 
                    value: "PRICE", 
                    currentValue: (exchangeBaseTokenBalance / exchangeAssetTokenBalance).toFixed(6),
                    suffix: baseToken.symbol,
                    data: candles ?? {},
                }
            ]}
        />
    );
};