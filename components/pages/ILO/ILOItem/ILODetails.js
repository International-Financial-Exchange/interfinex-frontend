import { useContext, useState } from "react";
import { Card } from "../../../core/Card";
import { StyledCountdown } from "../../../core/StyledCountdown";
import Text from "../../../core/Text";
import { IloContext } from "./ILOItem";
import styled, { ThemeContext } from "styled-components";
import { StatusIndicator, ILO_STATUS } from "../ILOList/ILOListItem";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { getIloCurrentTokensPerEth, IloProgressBar, ILO_TYPE_NAMES } from "../utils";
import Skeleton from "react-loading-skeleton";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { EthersContext } from "../../../../context/Ethers";
import { humanizeTokenAmount } from "../../../../utils/utils";
import { TextButton } from "../../../core/Button";

const Container = styled(Card)`
    width: 100%;
    padding: ${PIXEL_SIZING.medium};
    display: grid;
    row-gap: ${PIXEL_SIZING.medium};
`;

export const ILODetails = () => {
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const { ilo, isLoading } = useContext(IloContext);
    
    const { 
        hasEnded, 
        name, 
        description, 
        endDate, 
        ethInvested, 
        type, 
        additionalDetails, 
        assetTokenAmount, 
        assetToken,
        contractAddress 
    } = ilo || {};
    
    const tokensPerEth = getIloCurrentTokensPerEth(ilo || {});

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
                            <StatusIndicator
                                status={hasEnded ? ILO_STATUS.ended : ILO_STATUS.live}
                            />

                            <Text>
                                {ILO_TYPE_NAMES[type]}
                            </Text>
                        </div>


                        <Text secondary>
                            {description}
                        </Text>

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.tiny }}>
                                <TokenAndLogo token={ETHEREUM_TOKEN}>
                                    <Text>1 {ETHEREUM_TOKEN.symbol}</Text>
                                </TokenAndLogo>
                                <Text>=</Text>
                                <Text>{humanizeTokenAmount(Number.isNaN(tokensPerEth) ? 0 : tokensPerEth, assetToken).toFixed(6)} {assetToken.symbol}</Text>
                            </div>

                            <div style={{ display: "flex", marginLeft: PIXEL_SIZING.large }}>
                                <Text style={{ marginRight: PIXEL_SIZING.tiny }}>Price per Token:</Text>
                                <Text>{(1 / humanizeTokenAmount(tokensPerEth, assetToken)).toFixed(6)} ETH</Text>
                            </div>
                        </div>

                        <div style={{ marginTop: PIXEL_SIZING.medium }}>
                            <Text bold style={{ textAlign: "center" }}>ILO Progress</Text>
                            <IloProgressBar ilo={ilo}/>
                        </div>

                        <TextButton 
                            style={{ justifySelf: "right" }}
                            onClick={() => setShowMoreDetails(!showMoreDetails)}
                        >
                            {showMoreDetails ? "Hide" : "Show"} more details
                        </TextButton>

                        {
                            showMoreDetails &&
                                <>
                                    <FixedPriceAdditionalDetails/>

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

const FixedPriceAdditionalDetails = props => {
    const { ilo, isLoading } = useContext(IloContext);
    const theme = useContext(ThemeContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    
    console.log(ilo);
    const { 
        endDate, 
        startDate,
        additionalDetails, 
        assetTokenAmount, 
        assetToken,
        percentageToLock,
        liquidityUnlockDate,
        softCap
    } = ilo || {};

    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.larger, }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.small, alignItems: "center" }}>
                <Text secondary>Start Date</Text>
                <Text>{new Date(startDate * 1000).toLocaleString()}</Text>

                <Text secondary>Liquidity Lock Amount</Text>                
                <Text style={{ color: theme.colors.positive }}>{percentageToLock.toFixed(2)}%</Text>

                <Text secondary style={{ marginRight: PIXEL_SIZING.small }}>Soft Cap</Text>
                <Text>{(softCap / additionalDetails.tokensPerEth).toFixed(6)} ETH</Text>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.small }}>
                <Text secondary>End Date</Text>
                <Text>{new Date(endDate * 1000).toLocaleString()}</Text>

                <Text secondary>Liquidity Unlock Date</Text>
                <Text>{new Date(liquidityUnlockDate * 1000).toLocaleString()}</Text>

                <Text secondary>Total Tokens for Sale</Text>
                <Text>{humanizeTokenAmount(assetTokenAmount, assetToken).toFixed(6)} {assetToken.symbol}</Text>
            </div>
        </div>
    );
};