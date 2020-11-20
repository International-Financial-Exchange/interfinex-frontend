import { useContext, useEffect, useState } from "react";
import { EthersContext } from "../../../../context/Ethers";

export const useMarginTrading = ({ assetToken, baseToken, swapMarketExists }) => {
    const { contracts: { MarginFactory, createContract }} = useContext(EthersContext);
    const [isMarginEnabled, setIsMarginEnabled] = useState();
    const [marketExists, setMarketExists] = useState();
    const [AssetTokenMarginMarket, setAssetTokenMarginMarket] = useState();
    const [BaseTokenMarginMarket, setBaseTokenMarginMarket] = useState();
    
    useEffect(() => {
        if (swapMarketExists) {
            Promise.all([
                MarginFactory.pair_to_margin_market(assetToken.address, baseToken.address),
                MarginFactory.pair_to_margin_market(baseToken.address, assetToken.address)
            ]).then(([assetTokenMarketAddress, baseTokenMarketAddress]) => {
                // Check if marrket exists here then set state

                setAssetTokenMarginMarket(createContract(assetTokenMarketAddress, "MarginMarket"));
                setBaseTokenMarginMarket(createContract(baseTokenMarketAddress, "MarginMarket"));
            });
        }
    }, [swapMarketExists]);

    return { isMarginEnabled, setIsMarginEnabled };
};