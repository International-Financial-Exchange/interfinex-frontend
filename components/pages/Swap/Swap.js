import { TradePortal } from "./TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING, humanizeTokenAmount } from "../../../utils";
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

export const SwapContext = createContext();

const hasAllowance = allowance => allowance.gte(ethers.constants.MaxUint256.div(BigNumber.from('100')));

const SwapContainer = styled.div`
    margin-top: ${PIXEL_SIZING.medium}; 
    display: grid; 
    grid-template-columns: 1fr auto; 
    column-gap: ${PIXEL_SIZING.large};

    @media (max-width: 600px) {
        width: 100%;
        grid-template-columns: 1fr;
        column-gap: 0px;
        row-gap: ${PIXEL_SIZING.large};
    }
`;

export const Swap = () => {
    const { provider, contracts: { factoryContract, exchangeContractAbi, dividendErc20ContractAbi }} = useContext(EthersContext);
    const { token0, token1, assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { signer } = useContext(EthersContext);
    const { address } = useContext(AccountContext);
    const [marketExists, setMarketExists] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeContract, setExchangeContract] = useState();
    const [exchangeAssetTokenBalance, setExchangeAssetTokenBalance] = useState();
    const [exchangeBaseTokenBalance, setExchangeBaseTokenBalance] = useState();
    const [liquidityToken, setLiquidityToken] = useState();
    const [account, setAccount] = useState();
    const [factoryAllowances, setFactoryAllowances] = useState();
    const [exchangeAllowances, setExchangeAllowances] = useState();

    const updateExchangeAllowances = useCallback(async () => {
        if (address && (!exchangeAllowances || Object.values(exchangeAllowances).some(v => !v))) {
            Promise.all([
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
                assetToken.contract.allowance(address, factoryContract.address, { gasLimit: 1000000 }),
                baseToken.contract.allowance(address, factoryContract.address, { gasLimit: 1000000 }),
                ifexToken.contract.allowance(address, factoryContract.address, { gasLimit: 1000000 }),
            ]).then(([assetAllowance, baseAllowance, ifexAllowance]) =>
                setFactoryAllowances({
                    hasAssetTokenAllowance: hasAllowance(assetAllowance),
                    hasBaseTokenAllowance: hasAllowance(baseAllowance),
                    hasIfexTokenAllowance: hasAllowance(ifexAllowance),
                })
            );
        }
    }, [factoryContract, assetToken, baseToken, address]);


    const approveFactory = useCallback(async () => {
        const { hasAssetTokenAllowance, hasBaseTokenAllowance, hasIfexTokenAllowance } = factoryAllowances;

        if (!hasAssetTokenAllowance)
            await assetToken.contract.approve(factoryContract.address, ethers.constants.MaxUint256,);

        if (!hasBaseTokenAllowance)
            await baseToken.contract.approve(factoryContract.address, ethers.constants.MaxUint256,);

        if (!hasIfexTokenAllowance)
            await ifexToken.contract.approve(factoryContract.address, ethers.constants.MaxUint256,);
    }, [factoryContract, assetToken, baseToken, ifexToken, factoryAllowances]);

    // check swap market exists and update contract and liquidity token
    useEffect(() => {
        setIsLoading(true);

        if (baseToken && assetToken) {
            factoryContract.pair_to_exchange(baseToken.address, assetToken.address, { gasLimit: 100000 }).then(async exchangeAddress => {
                console.log("exchange", exchangeAddress)
                const marketExists = exchangeAddress !== ethers.constants.AddressZero;
                setMarketExists(marketExists);
    
                if (marketExists) {
                    const exchangeContract = new ethers.Contract(exchangeAddress, exchangeContractAbi, signer || provider);
                    setExchangeContract(exchangeContract);
    
                    const liquidityTokenAddress = await exchangeContract.liquidity_token({ gasLimit: 1000000 });
                    const liquidityToken = new ethers.Contract(liquidityTokenAddress, dividendErc20ContractAbi, signer || provider);
                    setLiquidityToken(liquidityToken);
                }
    
                setIsLoading(false);
            });
        }
    }, [provider, baseToken, assetToken]);

    useEffect(() => {
        updateFactoryAllowances();
    }, [baseToken, assetToken, ifexToken, factoryContract]);

    // On exchange update, check the new exchange balance, the exchange allowance and the current liquidity balance of the user
    useEffect(() => {
        if (exchangeContract) {

        baseToken.contract.allowance(factoryContract.address, exchangeContract.address, { gasLimit: 1000000 }).then(res => console.log("base balance from factory to exchange", res));
    
        assetToken.contract.allowance(factoryContract.address, exchangeContract.address, { gasLimit: 1000000 }).then(res => console.log("asset balance from factory to exchange", res));    
        Promise.all([
                assetToken.contract.balanceOf(exchangeContract.address, { gasLimit: 10000000 }),
                baseToken.contract.balanceOf(exchangeContract.address, { gasLimit: 10000000 })
            ]).then(async ([assetTokenBalance, baseTokenBalance]) => {
                const exchangeAssetTokenBalance = humanizeTokenAmount(assetTokenBalance, assetToken);
                const exchangeBaseTokenBalance = humanizeTokenAmount(baseTokenBalance, baseToken);

                setExchangeAssetTokenBalance(exchangeAssetTokenBalance);
                setExchangeBaseTokenBalance(exchangeBaseTokenBalance);
            });

            if (signer && liquidityToken) {
                updateExchangeAllowances();

                // Update the liquidity for the user and the total liquidity
                Promise.all([
                    liquidityToken.totalSupply({ gasLimit: 10000000 }).then(totalSupply => humanizeTokenAmount(totalSupply, { decimals: 18 })),
                    liquidityToken.balanceOf(address, { gasLimit: 800000 }).then(balance => humanizeTokenAmount(balance, { decimals: 18 }))
                ]).then(async ([liquidityTokenTotalSupply, liquidityTokenBalance]) => {
                    setAccount(old => ({
                        ...old,
                        liquidityTokenBalance,
                        depositedAssetTokenAmount: exchangeAssetTokenBalance * liquidityTokenBalance / liquidityTokenTotalSupply,
                        depositedBaseTokenAmount: exchangeBaseTokenBalance * liquidityTokenBalance / liquidityTokenTotalSupply
                    }));
                });
            }
        }
    }, [exchangeContract, signer, liquidityToken]);

    return (
        <Layout>
            <SwapContext.Provider 
                value={{
                    exchangeContract,
                    exchangeAssetTokenBalance,
                    exchangeBaseTokenBalance,
                    approveFactory,
                    approveExchange,
                    price: parseFloat(exchangeAssetTokenBalance ?? 0) / parseFloat(exchangeBaseTokenBalance ?? 0),
                    account,
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
                            <SwapContainer>
                                <div style={{ display: "grid", height: "fit-content", rowGap: PIXEL_SIZING.large }}>
                                    <TradeInfoChart/>
                                    <HistoricalTrades/>
                                </div>
                                
                                <div style={{ display: "grid", rowGap: PIXEL_SIZING.large, height: "fit-content" }}>
                                    <TradePortal/>
                                    <YourLiquidity/>
                                </div>
                            </SwapContainer>
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