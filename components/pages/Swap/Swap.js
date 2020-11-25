import { TradePortal } from "./TradePortal/TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING, humanizeTokenAmount, hasAllowance } from "../../../utils";
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

export const SwapContext = createContext();
export const MarginContext = createContext();

export const Swap = () => {
    const { provider, signer, contracts: { SwapFactory, getAbi, }} = useContext(EthersContext);
    const { token0, token1, assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const [marketExists, setMarketExists] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeContract, setExchangeContract] = useState();
    const [exchangeAssetTokenBalance, setExchangeAssetTokenBalance] = useState();
    const [exchangeBaseTokenBalance, setExchangeBaseTokenBalance] = useState();
    const [liquidityToken, setLiquidityToken] = useState();
    const [account, setAccount] = useState();
    const [factoryAllowances, setFactoryAllowances] = useState();
    const [exchangeAllowances, setExchangeAllowances] = useState();
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

    const updateExchangeAllowances = useCallback(async () => {
        if (address && (!exchangeAllowances || Object.values(exchangeAllowances).some(v => !v))) {
            await Promise.all([
                assetToken.contract.allowance(address, exchangeContract.address, { gasLimit: 1000000 }),
                baseToken.contract.allowance(address, exchangeContract.address, { gasLimit: 1000000 }),
                liquidityToken.allowance(address, exchangeContract.address, { gasLimit: 1000000 }),
            ]).then(([assetAllowance, baseAllowance, liquidityAllowance]) =>
                setExchangeAllowances({
                    hasAssetTokenAllowance: hasAllowance(assetAllowance),
                    hasBaseTokenAllowance: hasAllowance(baseAllowance),
                    hasLiquidityTokenAllowance: hasAllowance(liquidityAllowance),
                })
            );
        }
    }, [exchangeContract, assetToken, baseToken, liquidityToken, address]);

    const approveExchange = useCallback(async (...tokensToApprove) => {
        const { hasAssetTokenAllowance, hasBaseTokenAllowance, hasLiquidityTokenAllowance } = exchangeAllowances;

        if (!hasAssetTokenAllowance && tokensToApprove.some(({ address }) => address === assetToken.address))
            await assetToken.contract.approve(exchangeContract.address, ethers.constants.MaxUint256,);

        if (!hasBaseTokenAllowance && tokensToApprove.some(({ address }) => address === baseToken.address))
            await baseToken.contract.approve(exchangeContract.address, ethers.constants.MaxUint256,);

        if (!hasLiquidityTokenAllowance && tokensToApprove.some(({ address }) => address === liquidityToken.address))
            await liquidityToken.approve(exchangeContract.address, ethers.constants.MaxUint256,);
    }, [exchangeContract, assetToken, baseToken, liquidityToken, exchangeAllowances,]);

    const updateFactoryAllowances = useCallback(async () => {
        if ((assetToken && baseToken && address) && (!factoryAllowances || Object.values(factoryAllowances).some(v => !v))) {
            Promise.all([
                assetToken.contract.allowance(address, SwapFactory.address, { gasLimit: 1000000 }),
                baseToken.contract.allowance(address, SwapFactory.address, { gasLimit: 1000000 }),
                ifexToken.contract.allowance(address, SwapFactory.address, { gasLimit: 1000000 }),
            ]).then(([assetAllowance, baseAllowance, ifexAllowance]) =>
                setFactoryAllowances({
                    hasAssetTokenAllowance: hasAllowance(assetAllowance),
                    hasBaseTokenAllowance: hasAllowance(baseAllowance),
                    hasIfexTokenAllowance: hasAllowance(ifexAllowance),
                })
            );
        }
    }, [SwapFactory, assetToken, baseToken, address]);

    const approveFactory = useCallback(async () => {
        const { hasAssetTokenAllowance, hasBaseTokenAllowance, hasIfexTokenAllowance } = factoryAllowances;

        if (!hasAssetTokenAllowance)
            await assetToken.contract.approve(SwapFactory.address, ethers.constants.MaxUint256,);

        if (!hasBaseTokenAllowance)
            await baseToken.contract.approve(SwapFactory.address, ethers.constants.MaxUint256,);

        if (!hasIfexTokenAllowance)
            await ifexToken.contract.approve(SwapFactory.address, ethers.constants.MaxUint256,);
    }, [SwapFactory, assetToken, baseToken, ifexToken, factoryAllowances]);

    // Check swap market exists and update contract and liquidity token
    useEffect(() => {
        setIsLoading(true);

        if (baseToken && assetToken) {
            SwapFactory.pair_to_exchange(baseToken.address, assetToken.address, { gasLimit: 100000 }).then(async exchangeAddress => {
                console.log(exchangeAddress)
                const marketExists = exchangeAddress !== ethers.constants.AddressZero;
                setMarketExists(marketExists);
    
                if (marketExists) {
                    const exchangeContract = new ethers.Contract(exchangeAddress, getAbi("SwapExchange"), signer || provider);
                    setExchangeContract(exchangeContract);
    
                    const liquidityTokenAddress = await exchangeContract.liquidity_token({ gasLimit: 1000000 });
                    const liquidityToken = new ethers.Contract(liquidityTokenAddress, getAbi("DividendERC20"), signer || provider);
                    setLiquidityToken(liquidityToken);
                }
    
                setIsLoading(false);
            });
        }
    }, [provider, baseToken, assetToken]);

    useEffect(() => {
        updateFactoryAllowances();
    }, [baseToken, assetToken, ifexToken, SwapFactory]);

    const updateExchangeInfo = useCallback(async () => {
        const [exchangeAssetTokenBalance, exchangeBaseTokenBalance] = await Promise.all([
            assetToken.contract.balanceOf(exchangeContract.address, { gasLimit: 800000 }),
            baseToken.contract.balanceOf(exchangeContract.address, { gasLimit: 800000 })
        ]).then(async ([assetTokenBalance, baseTokenBalance]) => {
            return [humanizeTokenAmount(assetTokenBalance, assetToken), humanizeTokenAmount(baseTokenBalance, baseToken)];
        });

        setExchangeAssetTokenBalance(exchangeAssetTokenBalance);
        setExchangeBaseTokenBalance(exchangeBaseTokenBalance);

        if (signer && liquidityToken && address) {
            const exchangeAllowancePromise = updateExchangeAllowances();
            
            // Update the liquidity for the user and the total liquidity
            const accountLiquidityPromise = Promise.all([
                liquidityToken.totalSupply({ gasLimit: 800000 }).then(totalSupply => humanizeTokenAmount(totalSupply, { decimals: 18 })),
                liquidityToken.balanceOf(address, { gasLimit: 800000 }).then(balance => humanizeTokenAmount(balance, { decimals: 18 }))
            ]).then(async ([liquidityTokenTotalSupply, liquidityTokenBalance]) => {
                setAccount(old => ({
                    ...old,
                    liquidityTokenBalance,
                    depositedAssetTokenAmount: exchangeAssetTokenBalance * liquidityTokenBalance / liquidityTokenTotalSupply,
                    depositedBaseTokenAmount: exchangeBaseTokenBalance * liquidityTokenBalance / liquidityTokenTotalSupply
                }));
            });

            return Promise.all([exchangeAllowancePromise, accountLiquidityPromise]);
        }

        return;
    }, [exchangeContract, liquidityToken, signer, address]);

    // On exchange update, check the new exchange balance, the exchange allowance and the current liquidity balance of the user
    useEffect(() => {
        if (exchangeContract) {
            setIsExchangeInfoLoading(true);
            updateExchangeInfo().then(() => {
                setIsExchangeInfoLoading(false);
            });

            exchangeContract.on("Swap", () => {
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
    }, [exchangeContract, signer, liquidityToken, updateExchangeInfo]);

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
                    price: parseFloat(exchangeAssetTokenBalance ?? 0) / parseFloat(exchangeBaseTokenBalance ?? 0),
                    account,
                    liquidityToken,
                }}
            >
                <MarginContext.Provider value={marginContextState}>     
                    {
                        showCreateMarginMarket &&
                            <CreateMarginMarket closeCreateMarginMarket={() => setShowCreateMarginMarket(false)}/>
                    }
                    {
                        isLoading || marginIsLoading ? 
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