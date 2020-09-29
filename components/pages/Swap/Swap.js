import { TradePortal } from "./TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING } from "../../../utils";
import { TradeInfoChart } from "./TradeInfoChart";
import { HistoricalTrades } from "./HistoricalTrades";
import { useContext, useEffect, useState } from "react";
import { EthersContext } from "../../../context/Ethers";
import { TokenPairContext } from "../../../context/TokenPair";
import { ethers, } from "ethers";
import Text from "../../core/Text";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Spinner } from "../../core/Spinner";
import { Card } from "../../core/Card";
import { Input } from "../../core/Input";
import Button, { TextButton } from "../../core/Button";
import { TokenAmountInput } from "../../core/TokenAmountInput";
import { CreateMarket } from "./CreateMarket";

export const Swap = () => {
    const { contracts: { factoryContract }} = useContext(EthersContext);
    const { token0, token1, assetToken, baseToken, imebToken } = useContext(TokenPairContext);
    const [marketExists, setMarketExists] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Check if swap market exists
    useEffect(() => {
        if (token0 && token1 && imebToken) {
            Promise.all([
                [token0, token1],
                [token0, imebToken],
                [token1, imebToken],
            ].map(async pair => {
                const exchange = await factoryContract.pair_to_exchange(pair[0].address, pair[1].address, { gasLimit: 100000 })
                return exchange !== ethers.constants.AddressZero;
            })).then(exchangesExist => {
                setMarketExists(exchangesExist.every(v => v));
                setIsLoading(false);
            });
        }
    }, [factoryContract, token0, token1]);

    return (
        <Layout>
            {
                isLoading ? 
                    <Spinner
                        style={{ 
                            position: "absolute", 
                            left: "50%", 
                            top: 300, 
                            transform: "translate(-50%, -50%)" 
                        }}
                    />
                : 
                    marketExists ?
                        <div style={{ marginTop: PIXEL_SIZING.medium, display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.large }}>
                            <div style={{ display: "grid", rowGap: PIXEL_SIZING.large }} >
                                <TradeInfoChart/>
                                <HistoricalTrades/>
                            </div>
                            
                            <div>
                                <TradePortal/>
                            </div>
                        </div>
                    :
                        <div 
                            style={{ 
                                marginTop: PIXEL_SIZING.larger, 
                                display: "grid", 
                                justifyItems: "center",
                                rowGap: PIXEL_SIZING.medium,
                            }}
                        >
                            <div style={{ textAlign: "center", display: "grid", rowGap: PIXEL_SIZING.miniscule }}>
                                <Text secondary>This swap market does not exist yet.</Text>
                                <Text secondary>Deposit liquidity to create it.</Text>
                            </div>

                            <CreateMarket/>
                        </div>
            }
        </Layout>
    );
};