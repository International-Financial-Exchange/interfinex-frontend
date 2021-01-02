import styled from "styled-components";
import { TradeInfoChart } from "./TradeInfoChart";
import { HistoricalTrades } from "./HistoricalTrades";
import { TradePortal } from "./TradePortal/TradePortal";
import { MarginContext, SwapContext } from "./Swap";
import { YourPositions } from "./Margin/YourPositions";
import { useContext } from "react";
import { PIXEL_SIZING } from "../../../utils/constants";
import { LiquidityPreview } from "./LiquidityPreview/LiquidityPreview";

const Container = styled.div`
    display: grid; 
    grid-template-columns: 1fr auto; 
    column-gap: ${PIXEL_SIZING.large};

    @media (max-width: 600px) {
        width: 100%;
        grid-template-columns: 1fr;
        column-gap: 0px;
        row-gap: ${PIXEL_SIZING.large};
    }
`;


export const TradeTab = ({ isSelected }) => {
    const { isMarginEnabled } = useContext(SwapContext);

    return (
        <div style={{ display: !isSelected ? "none" : "" }}>
            <Container>
                <div style={{ display: "grid", height: "fit-content", rowGap: PIXEL_SIZING.large }}>
                    <TradeInfoChart/>
                    <HistoricalTrades/>
                </div>
                
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.large, height: "fit-content" }}>
                    <TradePortal/>
                    {
                        isMarginEnabled &&
                            <YourPositions/>
                    }
                    <LiquidityPreview/>
                </div>
            </Container>
        </div>
    )
}