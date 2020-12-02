import { Chart } from "../../core/Chart";
import { useEffect, useContext, useState, useMemo } from "react";
import { getCandles } from "./networkRequests";
import { TokenPairContext } from "../../../context/TokenPair";
import { SwapContext } from "./Swap";
import { TIMEFRAMES } from "../../../utils/constants";

export const TradeInfoChart = () => {
    const CANDLES_TO_FETCH = [
        { timeframe: TIMEFRAMES["1m"], range: TIMEFRAMES["1h"], name: "1H" },
        { timeframe: TIMEFRAMES["15m"], range: TIMEFRAMES["1d"], name: "24H" },
        { timeframe: TIMEFRAMES["15m"], range: TIMEFRAMES["1w"], name: "1W" },
        { timeframe: TIMEFRAMES["4h"], range: Date.now(), name: "ALL" },
    ];

    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { exchangeAssetTokenBalance, exchangeBaseTokenBalance, isExchangeInfoLoading } = useContext(SwapContext);
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
                            [name]: candles.map(({ openTimestamp, close }) => ({ x: openTimestamp, y: close.toFixed(8) })),
                        }))
                    })
                    .catch(e => console.log(e));
            })
        }
    }, [assetToken?.address, baseToken?.address]);

    const chartData = useMemo(() => {
        return ([
            { 
                label: "Price", 
                value: "PRICE", 
                currentValue: isExchangeInfoLoading ? null : (exchangeBaseTokenBalance / exchangeAssetTokenBalance).toFixed(8),
                suffix: baseToken.symbol,
                data: candles ?? {},
            }
        ])
    }, [assetToken?.address, baseToken?.address, candles, exchangeAssetTokenBalance, exchangeBaseTokenBalance, isExchangeInfoLoading])

    return (
        <Chart
            options={chartData}
        />
    );
};