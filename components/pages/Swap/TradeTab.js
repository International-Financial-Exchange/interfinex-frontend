import { PIXEL_SIZING } from "../../../utils";
import styled from "styled-components";
import { TradeInfoChart } from "./TradeInfoChart";
import { HistoricalTrades } from "./HistoricalTrades";
import { TradePortal } from "./TradePortal";
import { YourLiquidity } from "./YourLiquidity";

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
    return (
        <div style={{ display: !isSelected ? "none" : "" }}>
            <Container>
                <div style={{ display: "grid", height: "fit-content", rowGap: PIXEL_SIZING.large }}>
                    <TradeInfoChart/>
                    <HistoricalTrades/>
                </div>
                
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.large, height: "fit-content" }}>
                    <TradePortal/>
                    <YourLiquidity/>
                </div>
            </Container>
        </div>
    )
}