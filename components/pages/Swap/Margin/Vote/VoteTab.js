import { createContext, useContext, useState } from "react";
import styled from "styled-components";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { PIXEL_SIZING } from "../../../../../utils/constants";
import { humanizeTokenAmount } from "../../../../../utils/utils";
import { TabSquareNav } from "../../../../core/TabSquareNav";
import { TokenAndLogo } from "../../../../core/TokenAndLogo";
import { MarginContext } from "../../Swap";
import { VotePortal } from "./VotePortal";

export const VoteContext = createContext();

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    width: 100%;

    > div {
        margin-right: ${PIXEL_SIZING.medium};
        margin-top: ${PIXEL_SIZING.medium};
    }
`;

export const PROPOSAL_IDS = {
    initialMargin: 1,
    maintenanceMargin: 2,
    interestMultiplier: 3,
    maxBorrowAmountRate: 4,  
    maxLiquidateVolumeRate: 5,
    votingDuration: 6,
};

export const PROPOSAL_INFO = {
    [PROPOSAL_IDS.initialMargin]: { 
        name: "Initial Margin", 
        description: "The minimum amount of collateral that a user must post relative to the amount borrowed.", 
        multiplier: 10, 
        contractKey: "minInitialMarginRate",
        formatValue: value => (humanizeTokenAmount(value, { decimals: 18 }) * 100).toFixed(4) + "%" 
    },
    [PROPOSAL_IDS.maintenanceMargin]: { 
        name: "Maintenance Margin", 
        description: "The amount of collateral that a user must post as insurance in case their position gets liquidated.", 
        multiplier: 5, 
        contractKey: "maintenanceMarginRate",
        formatValue: value => (humanizeTokenAmount(value, { decimals: 18 }) * 100).toFixed(4) + "%"
    },
    [PROPOSAL_IDS.interestMultiplier]: { 
        name: "Interest Multiplier", 
        description: "The multiplier on the utilisation rate to attain the current interest rate.\nCalculated like so: (utilisation rate * interest multiplier) ^ 2", 
        multiplier: 5, 
        contractKey: "interestMultiplier", 
        formatValue: value => humanizeTokenAmount(value, { decimals: 18 }).toFixed(4) + "x"
    },
    [PROPOSAL_IDS.maxBorrowAmountRate]: { 
        name: "Max Borrow Amount", 
        description: "The maxium amount that a user can borrow in a single position relative to the total assets in the funding pool.", 
        multiplier: 10, 
        contractKey: "maxBorrowAmountRate",
        formatValue: value => (humanizeTokenAmount(value, { decimals: 18 }) * 100).toFixed(4) + "%",
    },
    [PROPOSAL_IDS.maxLiquidateVolumeRate]: { 
        name: "Max Liquidate Volume", 
        description: "The maxium amount of liquidations that can occur in a single block relative to the total assets in the funding pool - if there is only one liquidation, then this value will be ignored.", 
        multiplier: 10, 
        contractKey: "maxLiquidateVolumeRate",
        formatValue: value => (humanizeTokenAmount(value, { decimals: 18 }) * 100).toFixed(4) + "%",
    },
    [PROPOSAL_IDS.votingDuration]: { 
        name: "Voting Duration", 
        description: "The amount of time that each vote lasts before it finishes.", 
        multiplier: 15, 
        contractKey: "votingDuration",
        formatValue: (value) => `${parseInt(humanizeTokenAmount(value, { decimals: 0 }) / 86400) + " days " + new Date(humanizeTokenAmount(value, { decimals: 0 }) * 1000).toISOString().substr(11, 8)}`,
    },
};

export const VOTING_OPTIONS = {
    down: 1,
    preserve: 2,
    up: 3,
};

export const VoteTab = ({ isSelected }) => {
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { marginMarkets, } = useContext(MarginContext);
    const [selectedToken, setSelectedToken] = useState(assetToken);

    const MarginMarket = marginMarkets[selectedToken.address];

    return (
        <VoteContext.Provider value={{ MarginMarket, selectedToken, }}>
            <div style={{ display: !isSelected ? "none" : "" }}>
                <TabSquareNav
                    value={selectedToken.address}
                    onChange={tokenAddress => {
                        setSelectedToken([assetToken, baseToken].find(({ address }) => address === tokenAddress));
                    }}
                    isHidden={isSelected}
                    items={
                        [assetToken, baseToken].map(token => ({
                            label: <TokenAndLogo token={token}/>, 
                            value: token.address
                        }))
                    }
                />

                <Container style={{ marginTop: PIXEL_SIZING.large }}>
                    {
                        _.values(PROPOSAL_IDS).map(proposalId =>
                            <VotePortal
                                MarginMarket={MarginMarket}
                                proposalId={proposalId}
                            />
                        )
                    }
                </Container>
            </div>
        </VoteContext.Provider>
    );
};
