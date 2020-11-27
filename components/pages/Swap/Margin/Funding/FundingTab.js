import { createContext, useContext, useState } from "react";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { PIXEL_SIZING } from "../../../../../utils";
import { TabSquareNav } from "../../../../core/TabSquareNav"
import { TokenAndLogo } from "../../../../core/TokenAndLogo";
import { FundingStats } from "./FundingStats";
import styled from "styled-components";
import { MarginContext } from "../../Swap";
import { FundingDepositPortal } from "./FundingDepositPortal";
import { FundingHistory } from "./FundingHistory";
import { YourFunding } from "./YourFunding";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr auto;
    row-gap: ${PIXEL_SIZING.large};
    column-gap: ${PIXEL_SIZING.large};

    #funding-stats {
        grid-column: 1 / 3;
    }

    @media (max-width: 800px) {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: none;

        #funding-stats {
            grid-column: auto;
        }
    }
`;

export const FundingContext = createContext();

export const FundingTab = ({ isSelected }) => {
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { marginMarkets, funding } = useContext(MarginContext);
    const [MarginMarket, setMarginMarket] = useState(marginMarkets[assetToken.address]);
    const [selectedToken, setSelectedToken] = useState(assetToken);

    return (
        <FundingContext.Provider value={{ MarginMarket, selectedToken, ...funding }}>
            <div style={{ display: !isSelected ? "none" : "" }}>
                <TabSquareNav
                    value={selectedToken.address}
                    onChange={tokenAddress => {
                        setMarginMarket(marginMarkets[tokenAddress]);
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

                <Container>
                    <div id={"funding-stats"}>
                        <FundingStats/>
                    </div>

                    <div>
                        <FundingHistory/>
                    </div>

                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.large }}>
                        <FundingDepositPortal/>
                        <YourFunding/>
                    </div>
                </Container>
            </div>
        </FundingContext.Provider>
    );
};