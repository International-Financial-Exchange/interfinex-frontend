import { ethers } from "ethers";
import { add, update } from "lodash";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { TokenPairContext } from "../../../../context/TokenPair";
import { hasAllowance, humanizeTokenAmount, isZeroAddress, useContractApproval } from "../../../../utils";
import { MarginContext, Swap } from "../Swap";
import { useFunding } from "./Funding/hooks";

export const useMarginTrading = ({ swapMarketExists }) => {
    const { contracts: { MarginFactory, createContract }} = useContext(EthersContext);
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
        [assetToken, ifexToken, AssetTokenMarginMarket?.liquidityToken({ gasLimit: 1_000_000 })]
    );
    const { approveContract: approveBaseTokenMarket } = useContractApproval(
        BaseTokenMarginMarket, 
        [baseToken, ifexToken, BaseTokenMarginMarket?.liquidityToken({ gasLimit: 1_000_000 })
    ]);
    
    useEffect(() => {
        if (swapMarketExists) {
            setIsLoading(true);
            Promise.all([
                MarginFactory.pair_to_margin_market(assetToken.address, baseToken.address),
                MarginFactory.pair_to_margin_market(baseToken.address, assetToken.address)
            ]).then(([assetTokenMarketAddress, baseTokenMarketAddress]) => {
                const marginMarketExists = !isZeroAddress(assetTokenMarketAddress) && !isZeroAddress(baseTokenMarketAddress);
                setMarginMarketExists(marginMarketExists);

                if (marginMarketExists) {
                    const AssetTokenMarginMarket = createContract(assetTokenMarketAddress, "MarginMarket");
                    setAssetTokenMarginMarket(AssetTokenMarginMarket);

                    const BaseTokenMarginMarket = createContract(baseTokenMarketAddress, "MarginMarket");
                    setBaseTokenMarginMarket(BaseTokenMarginMarket);

                    setMarginMarkets({
                        [assetToken.address]: AssetTokenMarginMarket,
                        [baseToken.address]: BaseTokenMarginMarket
                    });
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

    const updateParameters = async () => {
        await Promise.all(
            _.values(marginMarkets).map(async MarginMarket => {
                const [
                    interestMultiplier, 
                    minInitialMarginRate, 
                    maintenanceMarginRate, 
                    maxBorrowAmount
                ] = (await Promise.all([
                    MarginMarket.interestMultiplier({ gasLimit: 1_000_000 }),
                    MarginMarket.minInitialMarginRate({ gasLimit: 1_000_000 }),
                    MarginMarket.maintenanceMarginRate({ gasLimit: 1_000_000 }),
                    MarginMarket.maxBorrowAmount({ gasLimit: 1_000_000 })
                ])).map(res => humanizeTokenAmount(res, { decimals: 18 }));

                setParameters((oldState = {}) => {
                    const newState = _.cloneDeep(oldState);
                    newState[MarginMarket.address] = {
                        interestMultiplier,
                        minInitialMarginRate,
                        maintenanceMarginRate,
                        maxBorrowAmount
                    };
                    return newState;
                });
            })
        );
    };

    useEffect(() => {
        if (marginMarkets) {
            updateParameters();
        }
    }, [marginMarkets]);

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
        approveMarginMarket: {
            [assetToken?.address]: approveAssetTokenMarket,
            [baseToken?.address]: approveBaseTokenMarket,
        },
        funding,
    };
};