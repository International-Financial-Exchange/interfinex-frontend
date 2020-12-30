import { BigNumber } from "ethers";
import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { EthersContext } from "../../../context/Ethers";
import { MULTIPLIER, PIXEL_SIZING } from "../../../utils/constants";
import { humanizeMultiplier, humanizeTokenAmount } from "../../../utils/utils";
import { ProgressBar } from "../../core/ProgressBar";
import Text from "../../core/Text";
import Big from "big.js";

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
            console.log("hardcap", BigNumber.from(ilo.assetTokenAmount).mul(MULTIPLIER).div(BigNumber.from(ilo.additionalDetails.tokensPerEth)).toString());
            return humanizeMultiplier(BigNumber.from(ilo.assetTokenAmount).mul(MULTIPLIER).div(BigNumber.from(ilo.additionalDetails.tokensPerEth)));
        case ILO_TYPES.dutchAuction:
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

            const [startTokensPerEth, endTokensPerEth] = [
                new Big(ilo.additionalDetails.startTokensPerEth),
                new Big(ilo.additionalDetails.endTokensPerEth),
            ];
            
            const timeDelta = Math.floor(Date.now() / 1000) - ilo.startDate;
            const maxTimeDelta = ilo.endDate - ilo.startDate;
            const percentageComplete = timeDelta / maxTimeDelta;
            const maxPriceDelta = endTokensPerEth.sub(startTokensPerEth);
            const tokensPerEth = startTokensPerEth.add(maxPriceDelta.mul(percentageComplete));
            return tokensPerEth.toFixed(0);
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