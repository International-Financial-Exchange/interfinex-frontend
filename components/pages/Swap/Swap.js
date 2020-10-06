import { TradePortal } from "./TradePortal"
import { Layout } from "../../layout/Layout";
import { PIXEL_SIZING, CONTAINER_SIZING } from "../../../utils";
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

export const SwapContext = createContext();

export const Swap = () => {
    const { contracts: { factoryContract, exchangeContractAbi, dividendErc20ContractAbi }} = useContext(EthersContext);
    const { token0, token1, assetToken, baseToken, imebToken } = useContext(TokenPairContext);
    const { signer, address } = useContext(AccountContext);
    const [marketExists, setMarketExists] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeContract, setExchangeContract] = useState();
    const [exchangeAssetTokenBalance, setExchangeAssetTokenBalance] = useState();
    const [exchangeBaseTokenBalance, setExchangeBaseTokenBalance] = useState();
    const [liquidityToken, setLiquidityToken] = useState();
    const [account, setAccount] = useState();
    const [factoryHasAllowance, setFactoryHasAllowance] = useState(false);
    const [exchangeHasAllowance, setExchangeHasAllowance] = useState(false);

    const approveExchange = useCallback(() => {
        return Promise.all([
            assetToken.contract.approve(exchangeContract.address, ethers.constants.MaxUint256,),
            baseToken.contract.approve(exchangeContract.address, ethers.constants.MaxUint256,),
            liquidityToken.approve(exchangeContract.address, ethers.constants.MaxUint256,),
        ]);
    }, [exchangeContract, assetToken, baseToken, liquidityToken]);

    const approveFactory = useCallback(() => {
        return Promise.all([
            assetToken.contract.approve(factoryContract.address, ethers.constants.MaxUint256,),
            baseToken.contract.approve(factoryContract.address, ethers.constants.MaxUint256,),
            imebToken.approve(factoryContract.address, ethers.constants.MaxUint256,),
        ]);
    }, [factoryContract, assetToken, baseToken, imebToken]);

    // Check if swap market exists
    useEffect(() => {
        if (token0 && token1 && imebToken) {
            // Check that all required market pairs exist
            Promise.all(
                (token0.address !== imebToken.address && token1.address !== imebToken.address ?
                    [[token0, token1], [token0, imebToken], [token1, imebToken],]
                    : [[token0, token1]])
                .map(pair => 
                    factoryContract.pair_to_exchange(pair[0].address, pair[1].address, { gasLimit: 100000 })
                )
            ).then(async exchanges => {
                const marketExists = exchanges.every(address => address !== ethers.constants.AddressZero);
                setMarketExists(marketExists);

                if (marketExists && signer && address) {
                    Promise.all([
                        assetToken.contract.allowance(address, factoryContract.address, { gasLimit: 1000000 }),
                        baseToken.contract.allowance(address, factoryContract.address, { gasLimit: 1000000 }),
                        imebToken.contract.allowance(address, factoryContract.address, { gasLimit: 1000000 }),
                    ]).then(allowances => {
                        setFactoryHasAllowance(
                            allowances.every(v => v.gte(ethers.constants.MaxUint256.div(BigNumber.from('100'))))
                        );
                    });
                        
                    // TODO: Should be a server query not a blockchain/node query
                    // exchanges[0] is [token0, token1]
                    const exchangeContract = new ethers.Contract(exchanges[0], exchangeContractAbi, signer);
                    setExchangeContract(exchangeContract);

                    const liquidityToken = new ethers.Contract(
                        await exchangeContract.liquidity_token({ gasLimit: 1000000 }),
                        dividendErc20ContractAbi, 
                        signer,
                    );
                    setLiquidityToken(liquidityToken);
                    const accountLiquidityTokenBalance = ethers.utils.formatUnits(await liquidityToken.balanceOf(address, { gasLimit: 800000 }), 18);
                    setAccount(old => ({
                        ...old,
                        liquidityTokenBalance: accountLiquidityTokenBalance,
                    }));

                    Promise.all([
                        assetToken.contract.allowance(address, exchangeContract.address, { gasLimit: 1000000 }),
                        baseToken.contract.allowance(address, exchangeContract.address, { gasLimit: 1000000 }),
                        liquidityToken.allowance(address, exchangeContract.address, { gasLimit: 1000000 }),
                    ]).then(allowances => {
                        setExchangeHasAllowance(
                            allowances.every(v => v.gte(ethers.constants.MaxUint256.div(BigNumber.from('100'))))
                        );
                    });
                }

                setIsLoading(false);
            });
        }
    }, [factoryContract, token0, token1, signer, address]);

    useEffect(() => {
        if (exchangeContract) {
            Promise.all([
                assetToken.contract.balanceOf(exchangeContract.address, { gasLimit: 10000000 }),
                baseToken.contract.balanceOf(exchangeContract.address, { gasLimit: 10000000 })
            ]).then(async ([assetTokenBalance, baseTokenBalance]) => {
                const exchangeAssetTokenBalance = ethers.utils.formatUnits(assetTokenBalance, assetToken.decmials);
                const exchangeBaseTokenBalance = ethers.utils.formatUnits(baseTokenBalance, baseToken.decmials);

                setExchangeAssetTokenBalance(exchangeAssetTokenBalance);
                setExchangeBaseTokenBalance(exchangeBaseTokenBalance);

                if (account?.liquidityTokenBalance) {
                    const liquidityTokenTotalSupply = ethers.utils.formatUnits(await liquidityToken.totalSupply({ gasLimit: 10000000 }), 18);
                    setAccount(old => ({
                        ...old,
                        depositedAssetTokenAmount: (parseFloat(exchangeAssetTokenBalance) * parseFloat(account.liquidityTokenBalance) / parseFloat(liquidityTokenTotalSupply)).toString(),
                        depositedBaseTokenAmount: (parseFloat(exchangeBaseTokenBalance) * parseFloat(account.liquidityTokenBalance) / parseFloat(liquidityTokenTotalSupply)).toString()
                    }));
                }
            });
        }
    }, [exchangeContract, account?.liquidityTokenBalance]);

    return (
        <Layout>
            <SwapContext.Provider 
                value={{
                    exchangeContract,
                    exchangeAssetTokenBalance,
                    exchangeBaseTokenBalance,
                    factoryHasAllowance,
                    exchangeHasAllowance,
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
                            <div style={{ marginTop: PIXEL_SIZING.medium, display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.large }}>
                                <div style={{ display: "grid", height: "fit-content", rowGap: PIXEL_SIZING.large }}>
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