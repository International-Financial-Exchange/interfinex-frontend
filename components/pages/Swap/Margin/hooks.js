import { ethers } from "ethers";
import { update } from "lodash";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { TokenPairContext } from "../../../../context/TokenPair";
import { hasAllowance, isZeroAddress, useContractApproval } from "../../../../utils";
import { MarginContext, Swap } from "../Swap";
import { useFunding } from "./Funding/hooks";

export const useMarginTrading = ({ swapMarketExists }) => {
    const { contracts: { MarginFactory, createContract }} = useContext(EthersContext);
    const { assetToken, baseToken, } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const [isLoading, setIsLoading] = useState();
    const [isMarginEnabled, _setIsMarginEnabled] = useState();
    const [marginMarketExists, setMarginMarketExists] = useState();
    const [AssetTokenMarginMarket, setAssetTokenMarginMarket] = useState();
    const [BaseTokenMarginMarket, setBaseTokenMarginMarket] = useState();
    const [showCreateMarginMarket, setShowCreateMarginMarket] = useState();
    const [factoryAllowances, setFactoryAllowances] = useState();
    const [marginMarkets, setMarginMarkets] = useState();

    const funding = useFunding({ AssetTokenMarginMarket, BaseTokenMarginMarket });
    const { approveContract: approveAssetTokenMarket } = useContractApproval(
        AssetTokenMarginMarket, 
        [assetToken, AssetTokenMarginMarket?.liquidityToken({ gasLimit: 1_000_000 })]
    );
    const { approveContract: approveBaseTokenMarket } = useContractApproval(
        BaseTokenMarginMarket, 
        [baseToken, BaseTokenMarginMarket?.liquidityToken({ gasLimit: 1_000_000 })
    ]);
    
    useEffect(() => {
        if (swapMarketExists) {
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
        approveMarginMarket: {
            [assetToken?.address]: approveAssetTokenMarket,
            [baseToken?.address]: approveBaseTokenMarket,
        },
        funding,
    };
};