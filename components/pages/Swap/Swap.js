import { TradePortal } from "./TradePortal/TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING, humanizeTokenAmount, hasAllowance, useContractApproval } from "../../../utils";
import { TradeInfoChart } from "./TradeInfoChart";
import { HistoricalTrades } from "./HistoricalTrades";
import { useContext, useEffect, useState, createContext, useCallback } from "react";
import { EthersContext } from "../../../context/Ethers";
import { TokenPairContext } from "../../../context/TokenPair";
import { ethers, BigNumber, } from "ethers";
import Text from "../../core/Text";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Spinner } from "../../core/Spinner";
import { Card } from "../../core/Card";
import { Input } from "../../core/Input";
import { TextButton, Button } from "../../core/Button";
import { TokenAmountInput } from "../../core/TokenAmountInput";
import { CreateMarket } from "./CreateMarket";
import { YourLiquidity } from "./YourLiquidity";
import { AccountContext } from "../../../context/Account";
import styled from "styled-components";
import { TokenAndLogo } from "../../core/TokenAndLogo";
import { SwitchInput } from "../../core/SwitchInput";
import { useMarginTrading } from "./Margin/hooks";
import { CreateMarginMarket } from "./Margin/CreateMarginMarket";
import { TabNav } from "../../core/TabNav";
import { TradeTab } from "./TradeTab";
import { FundingTab } from "./Margin/Funding/FundingTab";
import { LiquidatorTab } from "./Margin/Liquidator/LiquidatorTab";
import { VoteTab } from "./Margin/Vote/VoteTab";
import { add } from "lodash";

export const SwapContext = createContext();
export const MarginContext = createContext();

export const Swap = () => {
    const { provider, signer, contracts: { SwapFactory, getAbi, SwapEthRouter, MarginEthRouter }} = useContext(EthersContext);
    const { token0, token1, assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const [marketExists, setMarketExists] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeContract, setExchangeContract] = useState();
    const [exchangeAssetTokenBalance, setExchangeAssetTokenBalance] = useState();
    const [exchangeBaseTokenBalance, setExchangeBaseTokenBalance] = useState();
    const [liquidityToken, setLiquidityToken] = useState();
    const [account, setAccount] = useState();
    const [isExchangeInfoLoading,setIsExchangeInfoLoading] = useState();
    const [selectedTab, setSelectedTab] = useState();
    const { 
        isMarginEnabled, 
        setIsMarginEnabled, 
        isLoading: marginIsLoading, 
        showCreateMarginMarket, 
        setShowCreateMarginMarket,
        ...marginContextState
    } = useMarginTrading({ assetToken, baseToken, swapMarketExists: marketExists });
    const { approveContract: approveExchange } = useContractApproval(
        exchangeContract, 
        [assetToken, baseToken, ifexToken, liquidityToken]
    );
    const { approveContract: approveFactory } = useContractApproval(
        SwapFactory, 
        [assetToken, baseToken, ifexToken]
    );
    const { approveContract: approveRouter } = useContractApproval(
        SwapEthRouter, 
        [assetToken, baseToken, ifexToken, liquidityToken]
    );
    const { approveContract: approveMarginRouter } = useContractApproval(
        MarginEthRouter, 
        [assetToken, baseToken, ifexToken, liquidityToken]
    );


    console.log("original", [assetToken, baseToken, ifexToken])

    // Check swap market exists and update contract and liquidity token
    useEffect(() => {
        setIsLoading(true);

        if (baseToken && assetToken) {
            SwapFactory.pair_to_exchange(baseToken.address, assetToken.address, { gasLimit: 100000 }).then(async exchangeAddress => {
                const marketExists = exchangeAddress !== ethers.constants.AddressZero;
                setMarketExists(marketExists);
    
                if (marketExists) {
                    const exchangeContract = new ethers.Contract(exchangeAddress, getAbi("SwapExchange"), signer || provider);
                    setExchangeContract(exchangeContract);
    
                    const liquidityTokenAddress = await exchangeContract.liquidity_token({ gasLimit: 1000000 });
                    const liquidityToken = new ethers.Contract(liquidityTokenAddress, getAbi("DividendERC20"), signer || provider);
                    setLiquidityToken({ address: liquidityToken.address, contract: liquidityToken });
                }
    
                setIsLoading(false);
            });
        }
    }, [baseToken?.address, assetToken?.address]);

    useEffect(() => {
        if (exchangeContract && liquidityToken) {
            setExchangeContract(new ethers.Contract(exchangeContract.address, getAbi("SwapExchange"), signer || provider));
            setLiquidityToken({
                ...liquidityToken,
                contract: new ethers.Contract(liquidityToken.address, getAbi("DividendERC20"), signer || provider),
            });
        }
    }, [signer, provider]);

    const updateExchangeInfo = useCallback(async () => {
        const [exchangeAssetTokenBalance, exchangeBaseTokenBalance] = await Promise.all([
            assetToken.contract.balanceOf(exchangeContract.address, { gasLimit: 800000 }),
            baseToken.contract.balanceOf(exchangeContract.address, { gasLimit: 800000 })
        ]).then(async ([assetTokenBalance, baseTokenBalance]) => {
            return [humanizeTokenAmount(assetTokenBalance, assetToken), humanizeTokenAmount(baseTokenBalance, baseToken)];
        });

        setExchangeAssetTokenBalance(exchangeAssetTokenBalance);
        setExchangeBaseTokenBalance(exchangeBaseTokenBalance);

        console.log("checking", signer, liquidityToken, address)
        if (signer && liquidityToken && address) {
            
            // Update the liquidity for the user and the total liquidity
            await Promise.all([
                liquidityToken.contract.totalSupply({ gasLimit: 800000 }).then(totalSupply => humanizeTokenAmount(totalSupply, { decimals: 18 })),
                liquidityToken.contract.balanceOf(address, { gasLimit: 800000 }).then(balance => humanizeTokenAmount(balance, { decimals: 18 }))
            ]).then(async ([liquidityTokenTotalSupply, liquidityTokenBalance]) => {
                console.log("liquidity token balance", liquidityTokenTotalSupply);
                setAccount(old => ({
                    ...old,
                    liquidityTokenBalance,
                    depositedAssetTokenAmount: exchangeAssetTokenBalance * liquidityTokenBalance / liquidityTokenTotalSupply,
                    depositedBaseTokenAmount: exchangeBaseTokenBalance * liquidityTokenBalance / liquidityTokenTotalSupply
                }));
            });
        }

        return;
    }, [exchangeContract?.address, liquidityToken?.address, address]);

    // On exchange update, check the new exchange balance, the exchange allowance and the current liquidity balance of the user
    useEffect(() => {
        if (exchangeContract) {
            setIsExchangeInfoLoading(true);
            updateExchangeInfo().then(() => {
                setIsExchangeInfoLoading(false);
            });

            exchangeContract.on("Swap", () => {
                console.log("new swap event")
                updateExchangeInfo();
            });

            exchangeContract.on("MintLiquidity", () => {
                updateExchangeInfo();
            });

            exchangeContract.on("BurnLiquidity", () => {
                updateExchangeInfo();
            });
        }
        
        return () => exchangeContract?.removeAllListeners();
    }, [exchangeContract?.address, address, liquidityToken?.address]);

    return (
        <Layout>
            <SwapContext.Provider 
                value={{
                    exchangeContract,
                    isExchangeInfoLoading,
                    exchangeAssetTokenBalance,
                    exchangeBaseTokenBalance,
                    approveFactory,
                    approveExchange,
                    isMarginEnabled,
                    approveRouter,
                    price: parseFloat(exchangeAssetTokenBalance ?? 0) / parseFloat(exchangeBaseTokenBalance ?? 0),
                    account,
                    liquidityToken,
                    approveMarginRouter,
                }}
            >
                <MarginContext.Provider value={marginContextState}>     
                    {
                        showCreateMarginMarket &&
                            <CreateMarginMarket closeCreateMarginMarket={() => setShowCreateMarginMarket(false)}/>
                    }
                    {
                        isLoading || (isMarginEnabled && marginIsLoading) ? 
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
                                <div style={{ paddingTop: PIXEL_SIZING.medium, }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", width: "100%", alignItems: "end", marginTop: PIXEL_SIZING.medium }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.small }}>
                                            <TokenAndLogo token={assetToken} primary/>
                                            <Text primary bold>/</Text>
                                            <TokenAndLogo token={baseToken} primary/>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", columnGap: PIXEL_SIZING.tiny }}>
                                            <Text bold>Enable Margin Trading</Text>
                                            <SwitchInput
                                                value={isMarginEnabled}
                                                onChange={e => setIsMarginEnabled(e)}
                                            />
                                        </div>
                                    </div>

                                    {
                                        isMarginEnabled &&
                                            <TabNav
                                                onChange={selected => setSelectedTab(selected)}
                                                style={{ marginTop: PIXEL_SIZING.medium }}
                                                items={[
                                                    { label: "Trade", value: "trade" }, 
                                                    { label: "Funding", value: "funding" }, 
                                                    { label: "Liquidator", value: "liquidator" },
                                                    { label: "Vote", value: "vote" },
                                                ]}
                                            />
                                    }

                                    <div style={{ marginTop: PIXEL_SIZING.large, }}>
                                        <TradeTab isSelected={!selectedTab || selectedTab === "trade"}/>
                                        {
                                            isMarginEnabled &&
                                                <>
                                                    <FundingTab isSelected={selectedTab === "funding"}/>
                                                    <LiquidatorTab isSelected={selectedTab === "liquidator"}/>
                                                    <VoteTab isSelected={selectedTab === "vote"}/>
                                                </>
                                        }
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
                </MarginContext.Provider>
            </SwapContext.Provider>
        </Layout>
    );
};