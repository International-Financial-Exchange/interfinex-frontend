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
    grid-template-areas: 
        "stats      stats"
        "history    account-info"
    ;
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
                    <div style={{ gridArea: "stats" }}>
                        <FundingStats/>
                    </div>

                    <div style={{ gridArea: "history", }}>
                        <FundingHistory/>
                    </div>

                    <div style={{ gridArea: "account-info", display: "grid", rowGap: PIXEL_SIZING.large }}>
                        <FundingDepositPortal/>
                        <YourFunding/>
                    </div>
                </Container>
            </div>
        </FundingContext.Provider>
    );
};