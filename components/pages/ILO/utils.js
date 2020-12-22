import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { EthersContext } from "../../../context/Ethers";
import { PIXEL_SIZING } from "../../../utils/constants";
import { humanizeTokenAmount } from "../../../utils/utils";
import { ProgressBar } from "../../core/ProgressBar";
import Text from "../../core/Text";

export const ILO_TYPES = {
    fixedPrice: 1,
    dutchAuction: 2,
};

export const ILO_TYPE_NAMES = {
    [ILO_TYPES.fixedPrice]: "Fixed Price",
    [ILO_TYPES.dutchAuction]: "Dutch Auction",
};

export const ILO_ABI_NAMES = {
    [ILO_TYPES.fixedPrice]: "FixedPriceILO",
    [ILO_TYPES.dutchAuction]: "DutchAuctionILO",
};

export const getIloEthHardcap = ilo => {
    switch (ilo.type) {
        case ILO_TYPES.fixedPrice:
            return ilo.assetTokenAmount / ilo.additionalDetails.tokensPerEth;
        case ILO_TYPES.dutchAuction:
            console.log("price", ((ilo.assetTokenAmount - ilo.additionalDetails.totalAssetTokensBought) / getIloCurrentTokensPerEth(ilo)))
            console.log(ilo.ethInvested);
            console.log(ilo.assetTokenAmount)
            console.log(ilo.assetTokensBought);
            return ilo.ethInvested + ((ilo.assetTokenAmount - ilo.additionalDetails.totalAssetTokensBought) / getIloCurrentTokensPerEth(ilo));
        default:
            console.warn(`Unsupported ILO type: [${ilo.type}]`);
            return 0;
    }
}; 

export const getIloCurrentTokensPerEth = ilo => {
    switch (ilo.type) {
        case ILO_TYPES.fixedPrice:
            return ilo.additionalDetails.tokensPerEth;
        case ILO_TYPES.dutchAuction:
            if (ilo.hasEnded) return ilo.additionalDetails.endTokensPerEth;
            
            const timeDelta = Math.floor(Date.now() / 1000) - ilo.startDate;
            const maxTimeDelta = ilo.endDate - ilo.startDate;
            const percentageComplete = timeDelta / maxTimeDelta;
            const maxPriceDelta = ilo.additionalDetails.endTokensPerEth - ilo.additionalDetails.startTokensPerEth;
            const tokensPerEth = ilo.additionalDetails.startTokensPerEth + (maxPriceDelta * percentageComplete);
            return tokensPerEth;
        default:
            console.warn(`Unsupported ILO type: [${ilo.type}]`);
            return 0;
    }
}; 

export const IloProgressBar = ({ ilo, secondary }) => {
    const theme = useContext(ThemeContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const { ethInvested, } = ilo;

    const ethHardcap = getIloEthHardcap(ilo);
    const progress = (ethInvested / ethHardcap) * 100;

    return (
        <div>
            <div style={{ marginBottom: PIXEL_SIZING.tiny, display: "grid", gridTemplateColumns: "1fr auto" }}>
                {
                    secondary ?
                        <div>
                            {parseFloat(ethInvested).toFixed(2)} ETH / {ethHardcap.toFixed(2)} ETH
                        </div>
                    :
                        <div>
                            Raised {parseFloat(ethInvested).toFixed(2)} ETH of {ethHardcap.toFixed(2)} ETH
                        </div>
                }

                {
                    !secondary &&
                        <div style={{ color: theme.colors.positive }}>
                            {Number.isNaN(progress) ? 0 : progress.toFixed(2)}%
                        </div>
                }
            </div>
                
            <div>
                <ProgressBar
                    maxValue={ethHardcap}
                    currentValue={ethInvested}
                />
            </div>
        </div>
    );
}