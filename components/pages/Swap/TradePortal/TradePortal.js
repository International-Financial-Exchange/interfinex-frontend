import Text from "../../../core/Text"
import { CONTAINER_SIZING, PIXEL_SIZING, parseTokenAmount, FEE_RATE } from "../../../../utils";
import styled, { ThemeContext } from "styled-components";
import { useState, useContext, useEffect } from "react";
import { ContentAndArrow } from "../../../core/ContentAndArrow";
import { TokenPairContext } from "../../../../context/TokenPair";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { TextButton, Button } from "../../../core/Button";
import { Input } from "../../../core/Input";
import { InputAndLabel } from "../../../core/InputAndLabel";
import { TokenSelectMenu } from "../../../layout/NavBar/AppNavBar";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { AccountContext } from "../../../../context/Account";
import { SwapContext } from "../Swap";
import { NotificationsContext } from "../../../../context/Notifications";
import ethers from "ethers";
import { Pool } from "./Pool";
import { SlippageSelect } from "../../../core/SlippageSelect";
import { BuySell } from "./BuySell";


const Container = styled.div`
    border-radius: ${PIXEL_SIZING.tiny};
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    display: grid;
    width: ${CONTAINER_SIZING.medium};
    overflow: hidden;
`;

const MenuTab = styled.div`
    padding: ${PIXEL_SIZING.medium} 0;
    width: 100%;
    border-bottom: 1px solid ${({ theme, isSelected }) => isSelected ? 0 : theme.colors.highlight};
    border-right: 1px solid ${({ theme }) => theme.colors.highlight};
    background-color: ${({ theme, isSelected }) => isSelected ? theme.colors.invert : theme.colors.unselected};
    font-weight: bold;
    
    &:last-child {
        border-top-right-radius: ${PIXEL_SIZING.tiny};
        border-right: 0;
    }

    &:first-child {
        border-top-left-radius: ${PIXEL_SIZING.tiny};
    }

    &:hover {
        cursor: pointer;
    }

    text-align: center;
`;

export const TradePortal = () => {
    const [selectedTab, setSelectedTab] = useState("BUY");
    const { isMarginEnabled } = useContext(SwapContext);
    const theme = useContext(ThemeContext);

    return (
        <Container>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", width: "100%", height: "fit-content" }}>
                {
                    [
                        { label: "Buy", value: "BUY" },
                        { label: "Sell", value: "SELL" },
                        { label: "Pool", value: "POOL" },
                    ].map(({ label, value }) =>
                        <MenuTab isSelected={selectedTab === value} onClick={() => setSelectedTab(value)}>
                            <Text 
                                primary
                                bold={selectedTab === value}
                                style={{ 
                                    color: selectedTab === value ? theme.colors.primary : theme.colors.textSecondary,
                                    fontSize: 15,
                                }}
                            >
                                {label}
                            </Text>
                        </MenuTab>
                    )
                }
            </div>

            {
                (() => {
                    switch (selectedTab) {
                        case "BUY":
                            return <BuySell isMargin={isMarginEnabled} isBuy key={false}/>;
                        case "SELL":
                            return <BuySell isMargin={isMarginEnabled} key={true}/>;
                        default:
                            return <Pool/>
                    }
                })()
            }
            
        </Container>
    );
};