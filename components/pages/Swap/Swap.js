import { TradePortal } from "./TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING } from "../../../utils";
import { TradeInfoChart } from "./TradeInfoChart";
import { HistoricalTrades } from "./HistoricalTrades";
import { useContext, useEffect, useState, createContext } from "react";
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
import { YourLiquidity } from "./YourLiquidity";
import { AccountContext } from "../../../context/Account";

export const SwapContext = createContext();

export const Swap = () => {
    const { contracts: { factoryContract, exchangeContractAbi, dividendErc20ContractAbi }} = useContext(EthersContext);
    const { token0, token1, assetToken, baseToken, imebToken } = useContext(TokenPairContext);
    const { signer } = useContext(AccountContext);
    const [marketExists, setMarketExists] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeContract, setExchangeContract] = useState();
    const [exchangeAssetTokenBalance, setExchangeAssetTokenBalance] = useState();
    const [exchangeBaseTokenBalance, setExchangeBaseTokenBalance] = useState();
    const [liquidityToken, setLiquidityToken] = useState();

    // Check if swap market exists
    useEffect(() => {
        if (token0 && token1 && imebToken) {
            Promise.all(
                [
                    [token0, token1],
                    [token0, imebToken],
                    [token1, imebToken],
                ].map(async pair => {
                    const exchange = await factoryContract.pair_to_exchange(pair[0].address, pair[1].address, { gasLimit: 100000 });
                    return exchange;
                })
            ).then(async exchanges => {
                const marketExists = exchanges.every(exchange => exchange !== ethers.constants.AddressZero);
                setMarketExists(marketExists);
                if (marketExists && signer) {
                    // exchanges[0] is [token0, token1]
                    const exchange = new ethers.Contract(exchanges[0], exchangeContractAbi, signer);
                    setExchangeContract(exchange);
                    setLiquidityToken(new ethers.Contract(
                        await exchange.liquidity_token({ gasLimit: 1000000 }),
                        dividendErc20ContractAbi, 
                        signer
                    ));
                }

                setIsLoading(false);
            });
        }
    }, [factoryContract, token0, token1, signer]);

    useEffect(() => {
        if (exchangeContract) {
            Promise.all([
                assetToken.contract.balanceOf(exchangeContract.address, { gasLimit: 10000000 }),
                baseToken.contract.balanceOf(exchangeContract.address, { gasLimit: 10000000 })
            ]).then(([assetTokenBalance, baseTokenBalance]) => {
                setExchangeAssetTokenBalance(ethers.utils.formatUnits(assetTokenBalance, assetToken.decmials));
                setExchangeBaseTokenBalance(ethers.utils.formatUnits(baseTokenBalance, baseToken.decmials));
            });
        }
    }, [exchangeContract]);

    return (
        <Layout>
            <SwapContext.Provider 
                value={{
                    exchangeContract,
                    exchangeAssetTokenBalance,
                    exchangeBaseTokenBalance,
                    liquidityToken,
                }}
            >
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
                                <div style={{ display: "grid", rowGap: PIXEL_SIZING.large }}>
                                    <TradeInfoChart/>
                                    <HistoricalTrades/>
                                </div>
                                
                                <div style={{ display: "grid", rowGap: PIXEL_SIZING.large, height: "fit-content" }}>
                                    <TradePortal/>
                                    <YourLiquidity/>
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
            </SwapContext.Provider>
        </Layout>
    );
};