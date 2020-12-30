import { useContext, useState } from "react";
import { Card } from "../../../core/Card";
import { StyledCountdown } from "../../../core/StyledCountdown";
import Text from "../../../core/Text";
import { IloContext } from "./ILOItem";
import styled, { ThemeContext } from "styled-components";
import { StatusIndicator, ILO_STATUS } from "../ILOList/ILOListItem";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { getIloCurrentTokensPerEth, IloProgressBar, ILO_TYPES, ILO_TYPE_NAMES } from "../utils";
import Skeleton from "react-loading-skeleton";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { EthersContext } from "../../../../context/Ethers";
import { humanizeMultiplier, humanizeTokenAmount, tokenAmountToBig } from "../../../../utils/utils";
import { TextButton } from "../../../core/Button";

const Container = styled(Card)`
    width: 100%;
    padding: ${PIXEL_SIZING.medium};
    display: grid;
    row-gap: ${PIXEL_SIZING.medium};

    @media (max-width: 1180px) {
        #price-per-token {
            margin-top: ${PIXEL_SIZING.small};
        }
    }

    .additional-details {
        display: grid; 
        grid-template-columns: auto 1fr; 
        column-gap: ${PIXEL_SIZING.larger};
        white-space: nowrap;

        @media (max-width: 1180px) {
            column-gap: 0;
            grid-template-columns: 1fr;
            row-gap: ${PIXEL_SIZING.small};
        }
    }
`;

export const ILODetails = () => {
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const { ilo, isLoading } = useContext(IloContext);
    
    const { 
        hasEnded, 
        name, 
        description, 
        id,
        endDate, 
        ethInvested, 
        type, 
        additionalDetails, 
        assetTokenAmount, 
        assetToken,
        contractAddress 
    } = ilo || {};
    
    const tokensPerEth = tokenAmountToBig(getIloCurrentTokensPerEth(ilo || {}), assetToken || {});

    return (
        <Container>
            {
                isLoading ?
                    <>
                        <Skeleton width={CONTAINER_SIZING.small} height={PIXEL_SIZING.medium}/>
                        <Skeleton height={CONTAINER_SIZING.miniscule}/>
                        <Skeleton height={CONTAINER_SIZING.microscopic}/>
                    </>
                :
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                            <StatusIndicator ilo={ilo}/>

                            <div style={{ display: "flex" }}>
                                <Text style={{ marginRight: PIXEL_SIZING.small }}>{ILO_TYPE_NAMES[type]}</Text>
                                <Text secondary>#{id}</Text>
                            </div>
                        </div>


                        <Text secondary>
                            {description}
                        </Text>

                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.tiny, marginRight: PIXEL_SIZING.large }}>
                                <TokenAndLogo token={ETHEREUM_TOKEN}>
                                    <Text>1 {ETHEREUM_TOKEN.symbol}</Text>
                                </TokenAndLogo>
                                <Text>=</Text>
                                <Text>{tokensPerEth.toFixed(6)} {assetToken.symbol}</Text>
                            </div>

                            <div id={"price-per-token"} style={{ display: "flex", }}>
                                <Text style={{ marginRight: PIXEL_SIZING.tiny }}>Price per Token:</Text>
                                <Text>{new Big(1).div(tokensPerEth).toFixed(6)} ETH</Text>
                            </div>
                        </div>

                        <IloProgressBar ilo={ilo}/>

                        <TextButton 
                            style={{ justifySelf: "right" }}
                            onClick={() => setShowMoreDetails(!showMoreDetails)}
                        >
                            {showMoreDetails ? "Hide" : "Show"} more details
                        </TextButton>

                        {
                            showMoreDetails &&
                                <>
                                    {
                                        (() => {
                                            switch (ilo?.type) {
                                                case ILO_TYPES.fixedPrice:
                                                    return <FixedPriceAdditionalDetails/>;
                                                case ILO_TYPES.dutchAuction:
                                                    return <DutchAuctionAdditionalDetails/>;
                                                default:
                                                    return;
                                            }
                                        })()
                                    }

                                    {/* <Text>
                                        ILO Contract: {contractAddress}
                                    </Text> */}
                                </>
                        }
                    </>
            }
        </Container>
    );
};

const DutchAuctionAdditionalDetails = props => {
    const { ilo, isLoading } = useContext(IloContext);
    const theme = useContext(ThemeContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    
    const { 
        endDate, 
        startDate,
        additionalDetails, 
        assetTokenAmount, 
        assetToken,
        percentageToLock,
        liquidityUnlockDate,
    } = ilo || {};

    return (
        <div className={"additional-details"}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.small, alignItems: "center" }}>
                <Text secondary>Start Date</Text>
                <Text>{new Date(startDate * 1000).toLocaleString()}</Text>

                <Text secondary>Start Price</Text>
                <Text>1 ETH = {tokenAmountToBig(additionalDetails.startTokensPerEth, assetToken)} {assetToken.symbol}</Text>

                <Text secondary>Liquidity Lock Amount</Text>                
                <Text style={{ color: theme.colors.positive }}>{humanizeMultiplier(percentageToLock).toFixed(2)}%</Text>

                <Text secondary>Total Tokens for Sale</Text>
                <Text>{tokenAmountToBig(assetTokenAmount, assetToken).toFixed(6)} {assetToken.symbol}</Text>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.small, height: "fit-content" }}>
                <Text secondary>End Date</Text>
                <Text>{new Date(endDate * 1000).toLocaleString()}</Text>

                <Text secondary>End Price</Text>
                <Text>1 ETH = {tokenAmountToBig(additionalDetails.endTokensPerEth, assetToken)} {assetToken.symbol}</Text>

                <Text secondary>Liquidity Unlock Date</Text>
                <Text>{new Date(liquidityUnlockDate * 1000).toLocaleString()}</Text>
            </div>
        </div>
    );
};

const FixedPriceAdditionalDetails = props => {
    const { ilo, isLoading } = useContext(IloContext);
    const theme = useContext(ThemeContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    
    const { 
        endDate, 
        startDate,
        additionalDetails, 
        assetTokenAmount, 
        assetToken,
        percentageToLock,
        liquidityUnlockDate,
    } = ilo || {};

    return (
        <div className={"additional-details"}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.small, alignItems: "center" }}>
                <Text secondary>Start Date</Text>
                <Text>{new Date(startDate * 1000).toLocaleString()}</Text>

                <Text secondary>Liquidity Lock Amount</Text>                
                <Text style={{ color: theme.colors.positive }}>{humanizeMultiplier(percentageToLock).toFixed(2)}%</Text>

                <Text secondary style={{ marginRight: PIXEL_SIZING.small }}>Soft Cap</Text>
                <Text>{(additionalDetails.softCap / additionalDetails.tokensPerEth).toFixed(6)} ETH</Text>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.small, }}>
                <Text secondary>End Date</Text>
                <Text>{new Date(endDate * 1000).toLocaleString()}</Text>

                <Text secondary>Liquidity Unlock Date</Text>
                <Text>{new Date(liquidityUnlockDate * 1000).toLocaleString()}</Text>

                <Text secondary>Total Tokens for Sale</Text>
                <Text>{tokenAmountToBig(assetTokenAmount, assetToken).toFixed(6)} {assetToken.symbol}</Text>
            </div>
        </div>
    );
};