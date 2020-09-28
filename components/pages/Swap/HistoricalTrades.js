import styled from "styled-components";
import { PIXEL_SIZING } from "../../../utils";
import Text from "../../core/Text";
import { shade } from "../../../utils";
import { TextOption } from "../../core/TextOption";
import { useState } from "react";

const Container = styled.div`
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    padding: ${PIXEL_SIZING.small};
`;

const Table = styled.table`
    border-collapse: separate;
    border-spacing: 0 10px; 

    th {
        color: ${({ theme }) => theme.colors.textSecondary};
        font-weight: normal;
    }

    td {
        text-align: center;
        padding: ${PIXEL_SIZING.tiny};
    }
`;

const TradeRowContainer = styled.tr`
    background-color: ${({ theme, isBuy }) => shade(isBuy ? theme.colors.positive : theme.colors.negative, 0.9)};
    border-radius: ${PIXEL_SIZING.microscopic};
    display: grid;
    color: ${({ theme, isBuy }) => isBuy ? theme.colors.positive : theme.colors.negative};
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    padding: ${PIXEL_SIZING.tiny};
    justify-items: center;
    transition: transform 0.05s ease-out;

    &:hover {
        cursor: pointer;
        transform: scale(1.02);
    }
`;

const TradeHeaderContainer = styled(TradeRowContainer)`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 0;

    &:hover {
        transform: scale(1.0);
    }
`;

export const HistoricalTrades = () => {
    const [selectedTab, setSelectedTab] = useState("HISTORICAL");

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.medium }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.small }}>
                <TextOption 
                    selected={selectedTab === "HISTORICAL"}
                    onClick={() => setSelectedTab("HISTORICAL")}
                >
                    All Trades
                </TextOption>

                <TextOption 
                    selected={selectedTab === "YOUR_TRADES"}
                    onClick={() => setSelectedTab("YOUR_TRADES")}
                >
                    Your Trades
                </TextOption>
            </div>

            <Container>
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, }}>
                    <TradeHeaderContainer>
                        <Text secondary>Price</Text>
                        <Text secondary>Volume</Text>
                        <Text secondary>Timestamp</Text>
                        <Text secondary>Slippage</Text>
                        <Text secondary>Tx. ID</Text>
                    </TradeHeaderContainer>

                    <TradeRowContainer isBuy>
                        <div>0.00238</div>
                        <div>139.23</div>
                        <div>12:23:21 8th July</div>
                        <div>0.022%</div>
                        <div>0x012389...</div>
                    </TradeRowContainer>

                    <TradeRowContainer>
                        <div>0.00238</div>
                        <div>139.23</div>
                        <div>12:23:21 8th July</div>
                        <div>0.022%</div>
                        <div>0x012389...</div>
                    </TradeRowContainer>

                    <TradeRowContainer>
                        <div>0.00238</div>
                        <div>139.23</div>
                        <div>12:23:21 8th July</div>
                        <div>0.022%</div>
                        <div>0x012389...</div>
                    </TradeRowContainer>

                    <TradeRowContainer isBuy>
                        <div>0.00238</div>
                        <div>139.23</div>
                        <div>12:23:21 8th July</div>
                        <div>0.022%</div>
                        <div>0x012389...</div>
                    </TradeRowContainer>

                    <TradeRowContainer>
                        <div>0.00238</div>
                        <div>139.23</div>
                        <div>12:23:21 8th July</div>
                        <div>0.022%</div>
                        <div>0x012389...</div>
                    </TradeRowContainer>

                    <TradeRowContainer>
                        <div>0.00238</div>
                        <div>139.23</div>
                        <div>12:23:21 8th July</div>
                        <div>0.022%</div>
                        <div>0x012389...</div>
                    </TradeRowContainer>
                </div>
            </Container>
        </div>
    );
};