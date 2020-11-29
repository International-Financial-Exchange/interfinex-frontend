import { ethers } from "ethers";
import { add, update } from "lodash";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { TokenPairContext } from "../../../../context/TokenPair";
import { useContractApproval } from "../../../../utils/hooks";
import { humanizeTokenAmount, isZeroAddress } from "../../../../utils/utils";
import { MarginContext, Swap } from "../Swap";
import { useFunding } from "./Funding/hooks";

export const useMarginTrading = ({ swapMarketExists }) => {
    const { contracts: { MarginFactory, createContract, MarginEthRouter }} = useContext(EthersContext);
    const { assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const [isLoading, setIsLoading] = useState();
    const [isMarginEnabled, _setIsMarginEnabled] = useState();
    const [marginMarketExists, setMarginMarketExists] = useState();
    const [AssetTokenMarginMarket, setAssetTokenMarginMarket] = useState();
    const [BaseTokenMarginMarket, setBaseTokenMarginMarket] = useState();
    const [showCreateMarginMarket, setShowCreateMarginMarket] = useState();
    const [factoryAllowances, setFactoryAllowances] = useState();
    const [marginMarkets, setMarginMarkets] = useState();
    const [parameters, setParameters] = useState();
    const [account, setAccount] = useState({ isLoading: true });

    const funding = useFunding({ AssetTokenMarginMarket, BaseTokenMarginMarket, marginMarkets });
    const { approveContract: approveAssetTokenMarket } = useContractApproval(
        AssetTokenMarginMarket, 
        [assetToken, ifexToken, marginMarkets?.[assetToken.address]?.liquidityToken]
    );
    const { approveContract: approveBaseTokenMarket } = useContractApproval(
        BaseTokenMarginMarket, 
        [baseToken, ifexToken, marginMarkets?.[baseToken.address]?.liquidityToken]
    );
    const { approveContract: approveMarginRouter } = useContractApproval(
        MarginEthRouter, 
        [
            assetToken, 
            baseToken, 
            ifexToken, 
            marginMarkets?.[baseToken.address]?.liquidityToken, 
            marginMarkets?.[assetToken.address]?.liquidityToken
        ]
    );

    useEffect(() => {
        if (swapMarketExists) {
            setIsLoading(true);
            Promise.all([
                MarginFactory.pair_to_margin_market(assetToken.address, baseToken.address),
                MarginFactory.pair_to_margin_market(baseToken.address, assetToken.address)
            ]).then(async ([assetTokenMarketAddress, baseTokenMarketAddress]) => {
                const marginMarketExists = !isZeroAddress(assetTokenMarketAddress) && !isZeroAddress(baseTokenMarketAddress);
                setMarginMarketExists(marginMarketExists);

                if (marginMarketExists) {
                    const AssetTokenMarginMarket = createContract(assetTokenMarketAddress, "MarginMarket");
                    setAssetTokenMarginMarket(AssetTokenMarginMarket);

                    const BaseTokenMarginMarket = createContract(baseTokenMarketAddress, "MarginMarket");
                    setBaseTokenMarginMarket(BaseTokenMarginMarket);

                    const [assetLiquidityToken, baseLiquidityToken] = await Promise.all([
                        AssetTokenMarginMarket.liquidityToken({ gasLimit: 1_000_000 }),
                        BaseTokenMarginMarket.liquidityToken({ gasLimit: 1_000_000 }),
                    ]);

                    const marginMarkets = {
                        [assetToken.address]: { 
                            ...AssetTokenMarginMarket, 
                            liquidityToken: { 
                                address: assetLiquidityToken,
                                contract: createContract(assetLiquidityToken, "DividendERC20") 
                            }, 
                        },
                        [baseToken.address]: { 
                            ...BaseTokenMarginMarket, 
                            liquidityToken: { 
                                address: baseLiquidityToken, 
                                contract: createContract(baseLiquidityToken, "DividendERC20") 
                            }, 
                        },
                    };

                    setMarginMarkets(marginMarkets);
                    await updateParameters(marginMarkets);
                }

                setIsLoading(false);
            });
        }
    }, [swapMarketExists, assetToken, baseToken]);

    const setIsMarginEnabled = value => {
        if (!value) return _setIsMarginEnabled(value);

        if (marginMarketExists) {
            _setIsMarginEnabled(value);
        } else {
            setShowCreateMarginMarket(true);
        }
    };

    const updateParameters = async marginMarkets => {
        await Promise.all(
            _.values(marginMarkets).map(async MarginMarket => {
                const [
                    interestMultiplier, 
                    minInitialMarginRate, 
                    maintenanceMarginRate, 
                    maxBorrowAmountRate
                ] = (await Promise.all([
                    MarginMarket.interestMultiplier({ gasLimit: 1_000_000 }),
                    MarginMarket.minInitialMarginRate({ gasLimit: 1_000_000 }),
                    MarginMarket.maintenanceMarginRate({ gasLimit: 1_000_000 }),
                    MarginMarket.maxBorrowAmountRate({ gasLimit: 1_000_000 })
                ])).map(res => humanizeTokenAmount(res, { decimals: 18 }));

                setParameters((oldState = {}) => {
                    const newState = _.cloneDeep(oldState);
                    newState[MarginMarket.address] = {
                        interestMultiplier,
                        minInitialMarginRate,
                        maintenanceMarginRate,
                        maxBorrowAmountRate
                    };
                    return newState;
                });
            })
        );
    };

    const updateAccount = async () => {
        setAccount({ isLoading: true });
        await Promise.all([
            AssetTokenMarginMarket.getPosition(address),
            BaseTokenMarginMarket.getPosition(address),
        ]).then(([assetPosition, basePosition]) => {
            setAccount({
                assetPosition: {
                    borrowedAmount: humanizeTokenAmount(assetPosition.borrowedAmount, { decimals: 18 }),
                    collateralAmount: humanizeTokenAmount(assetPosition.collateralAmount, { decimals: 18 }),
                    lastInterestIndex: humanizeTokenAmount(assetPosition.lastInterestIndex, { decimals: 18 }),
                    maintenanceMargin: humanizeTokenAmount(assetPosition.maintenanceMargin, { decimals: 18 }),
                },
                basePosition: {
                    borrowedAmount: humanizeTokenAmount(basePosition.borrowedAmount, { decimals: 18 }),
                    collateralAmount: humanizeTokenAmount(basePosition.collateralAmount, { decimals: 18 }),
                    lastInterestIndex: humanizeTokenAmount(basePosition.lastInterestIndex, { decimals: 18 }),
                    maintenanceMargin: humanizeTokenAmount(basePosition.maintenanceMargin, { decimals: 18 }),
                },
                isLoading: false,
            });
        });
    };

    useEffect(() => {
        if (address && marginMarkets) {
            updateAccount();
        }
    }, [address, marginMarkets]);

    // useEffect(() => {
    //     if (isloadin) return;
    //     if (isloading && router.ismarginenabled)  {
    //         setIsMarginEnabled(true);
    //     }
    // }, [router.ismarginenable, isloading]);

    return { 
        isMarginEnabled, 
        marginMarkets,
        setIsMarginEnabled, 
        isLoading, 
        marginMarketExists, 
        showCreateMarginMarket, 
        setShowCreateMarginMarket,
        parameters,
        account,
        approveMarginRouter,
        approveMarginMarket: {
            [assetToken?.address]: approveAssetTokenMarket,
            [baseToken?.address]: approveBaseTokenMarket,
        },
        funding,
    };
};