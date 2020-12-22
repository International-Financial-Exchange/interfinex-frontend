import Link from "next/link";
import { useContext } from "react";
import Countdown from "react-countdown";
import { EthersContext } from "../../../../context/Ethers";
import { humanizeTokenAmount } from "../../../../utils/utils";
import { ProgressBar } from "../../../core/ProgressBar";
import { StyledCountdown } from "../../../core/StyledCountdown";
import Text from "../../../core/Text";
import { getIloEthHardcap, IloProgressBar } from "../utils";

const { default: styled, ThemeContext } = require("styled-components");
const { PIXEL_SIZING, CONTAINER_SIZING } = require("../../../../utils/constants");
const { CardButton } = require("../../../core/CardButton");

const Container = styled.div`
    display: grid;
    row-gap: ${PIXEL_SIZING.medium};
    grid-template-rows: auto 1fr auto;
    word-wrap: break-word;
    word-break: break-word;
    overflow: hidden;
`;

export const ILO_STATUS = {
    live: "LIVE",
    ended: "ENDED",
};

export const StatusIndicator = ({ status }) => {
    const theme = useContext(ThemeContext);
    const color = status === ILO_STATUS.live ? theme.colors.positive : theme.colors.textSecondary;
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <div 
                style={{ 
                    borderRadius: 100, 
                    height: PIXEL_SIZING.tiny, 
                    width: PIXEL_SIZING.tiny,
                    backgroundColor: color,
                    marginRight: PIXEL_SIZING.tiny,
                }}
            />

            <div style={{ color }}>
                {status === ILO_STATUS.live ? "Live" : "Closed"}
            </div>
        </div>
    )
};


const StyledCardButton = styled(CardButton)` 
    margin-right: ${PIXEL_SIZING.large}; 
    margin-top: ${PIXEL_SIZING.large}; 
    width: ${CONTAINER_SIZING.small}; 
    height: ${CONTAINER_SIZING.small}; 
`;

export const ILOListItem = ({ ilo }) => {
    const { hasEnded, name, description, endDate, ethInvested, type, additionalDetails, assetTokenAmount, contractAddress } = ilo;

    return (
        <Link 
            as={`/app/ilo/item?contractAddress=${contractAddress}`}
            href={{
                pathname: "/app/ilo/item",
                query: { iloJson: JSON.stringify(ilo) },
            }}
        >
            <StyledCardButton>
                <Container>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.medium }}>
                        <StatusIndicator
                            status={hasEnded ? ILO_STATUS.ended : ILO_STATUS.live}
                        />
                                   
                        <StyledCountdown
                            date={hasEnded ? 0 : new Date(endDate * 1000)}
                        />
                    </div>

                    <div>
                        <Text bold>
                            {name}
                        </Text>
                        <Text 
                            secondary 
                            lineClamp={3}
                            style={{ 
                                marginTop: PIXEL_SIZING.small,
                                maxWidth: "100%",
                            }}
                        >
                            {description}
                        </Text>
                    </div>

                    <IloProgressBar secondary ilo={ilo}/>
                </Container>
            </StyledCardButton>
        </Link>
    );
};