import { TradePortal } from "./TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING, IMEB_TOKEN } from "../../../utils";
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
    const { token0, token1, assetToken, baseToken } = useContext(TokenPairContext);
    const [marketExists, setMarketExists] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Check if swap market exists
    useEffect(() => {
        factoryContract.pair_to_exchange(token0.address, token1.address, { gasLimit: 100000 }).then(exchange => {
            setMarketExists(exchange !== ethers.constants.AddressZero);
            setIsLoading(false);
        });
    }, [factoryContract]);

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
                    : marketExists ?
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