import Text from "../../core/Text"
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils";
import styled, { ThemeContext } from "styled-components";
import { useState, useContext } from "react";
import { ContentAndArrow } from "../../core/ContentAndArrow";
import { TokenPairContext } from "../../../context/TokenPair";
import { TokenAndLogo } from "../../core/TokenAndLogo";
import Button, { TextButton } from "../../core/Button";
import { Input } from "../../core/Input";
import { InputAndLabel } from "../../core/InputAndLabel";
import { TokenSelectMenu } from "../../layout/NavBar/AppNavBar";

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
    const theme = useContext(ThemeContext);

    return (
        <Container>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", width: "100%" }}>
                {
                    [
                        { label: "Buy", value: "BUY" },
                        { label: "Sell", value: "SELL" },
                        { label: "Pool", value: "POOL" },
                    ].map(({ label, value }) =>
                        <MenuTab isSelected={selectedTab === value} onClick={() => setSelectedTab(value)}>
                            <Text 
                                primary
                                style={{ 
                                    color: selectedTab === value ? theme.colors.primary : theme.colors.highlight,
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
                            return <TradeTab isBuy/>;
                        case "SELL":
                            return <TradeTab/>;
                        default:
                            return <PoolTab/>
                    }
                })()
            }
            
        </Container>
    );
};

const PoolTab = () => {
    const { assetToken, baseToken, setAssetToken, setBaseToken } = useContext(TokenPairContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const theme = useContext(ThemeContext);

    return (
        showTokenSelectMenu ?
            <TokenSelectMenu
                type={tokenSelectType}
                onChange={(selectedToken, isCustomToken) => {
                    if (tokenSelectType === "ASSET") setAssetToken(selectedToken, isCustomToken);
                    else setBaseToken(selectedToken, isCustomToken);
                }}
                onClose={() => {
                    setShowTokenSelectMenu(false);
                }}
            />
        :
            <div style={{ padding: PIXEL_SIZING.medium, display: "grid", rowGap: PIXEL_SIZING.small }}>
                <InputAndLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center" }}>
                        <Text>Amount to Pool</Text>
                        <TextButton text style={{ marginRight: PIXEL_SIZING.tiny }}>Max Deposit</TextButton>
                        <TextButton text>Max Withdraw</TextButton>
                    </div>

                    <div>
                        <div style={{ position: "relative", height: "fit-content" }}>
                            <TokenAndLogo 
                                token={assetToken}
                                onClick={() => {
                                    setShowTokenSelectMenu(true);
                                    setTokenSelectType("ASSET");
                                }}
                                style={{ 
                                    position: "absolute", 
                                    right: PIXEL_SIZING.small, 
                                    top: "50%", 
                                    transform: "translateY(-50%)", 
                                    fontWeight: "bold", 
                                    color: theme.colors.primary,
                                }}
                            >
                                <TextButton>
                                    {assetToken.symbol}
                                </TextButton>
                            </TokenAndLogo>

                            <Input
                                type={"number"}
                                style={{ paddingRight: PIXEL_SIZING.huge }}
                                ref={input => input && input.focus()}
                                placeholder={"0.0"}
                            />
                        </div>

                        <div style={{ position: "relative", height: "fit-content", marginTop: PIXEL_SIZING.small }}>
                            <TokenAndLogo 
                                token={baseToken}
                                onClick={() => {
                                    setShowTokenSelectMenu(true);
                                    setTokenSelectType("BASE");
                                }}
                                style={{ 
                                    position: "absolute", 
                                    right: PIXEL_SIZING.small, 
                                    top: "50%", 
                                    transform: "translateY(-50%)", 
                                    fontWeight: "bold", 
                                    color: theme.colors.primary,
                                }}
                            >
                                <TextButton>
                                    {baseToken.symbol}
                                </TextButton>
                            </TokenAndLogo>

                            <Input
                                type={"number"}
                                style={{ paddingRight: PIXEL_SIZING.huge }}
                                placeholder={"0.0"}
                            />
                        </div>
                    </div>

                    <Button style={{ width: "100%", height: PIXEL_SIZING.larger }}>
                        <Text primary style={{ color: "white", fontSize: 15 }}>
                            Deposit Liquidity
                        </Text>
                    </Button>

                    <Button secondary style={{ width: "100%", height: PIXEL_SIZING.larger }}>
                        <Text primary style={{ color: "white", fontSize: 15 }}>
                            Withdraw Liquidity
                        </Text>
                    </Button>

                    <div>
                        <Text secondary>1 {assetToken.symbol} = 1123.213 {baseToken.symbol}</Text>
                    </div>
                </InputAndLabel>
            </div>
    );
};

const SlippageOption = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 2px solid ${({ theme }) => theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    padding: ${PIXEL_SIZING.small};
    transition: all 0.08s ease-out;

    &:hover {
        cursor: pointer;
        border: 2px solid ${({ theme }) => theme.colors.primary};
    }
`;

const SlippageSelect = ({ onChange, value }) => {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(0px, 1fr))", justifyItems: "center", columnGap: PIXEL_SIZING.small }}>
            {
                [0.1, 0.5, 1, 5].map(option => 
                    <SlippageOption style={{ width: "100%", textAlign: "center" }}>
                        {option}%
                    </SlippageOption>
                )
            }
        </div>
    );
};

const TradeTab = ({ isBuy }) => {
    const { assetToken, baseToken, setAssetToken, setBaseToken } = useContext(TokenPairContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const theme = useContext(ThemeContext);
    
    return (
        showTokenSelectMenu ?
            <TokenSelectMenu 
                type={tokenSelectType}
                onChange={(selectedToken, isCustomToken) => {
                    if (tokenSelectType === "ASSET") setAssetToken(selectedToken, isCustomToken);
                    else setBaseToken(selectedToken, isCustomToken);
                }}
                onClose={() => {
                    setShowTokenSelectMenu(false);
                }}
            />
        :
            <div style={{ padding: PIXEL_SIZING.medium, display: "grid", rowGap: PIXEL_SIZING.small }}>
                <InputAndLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                        <Text>Amount to {isBuy ? "Buy" : "Sell"}</Text>
                        <TextButton text style={{ marginRight: PIXEL_SIZING.tiny }}>Max</TextButton>
                    </div>

                    <div style={{ position: "relative", height: "fit-content" }}>
                        <TextButton 
                            style={{ 
                                position: "absolute", 
                                right: PIXEL_SIZING.small, 
                                top: "50%", 
                                transform: "translateY(-50%)", 
                                fontWeight: "bold", 
                                color: theme.colors.primary,
                            }}
                        >
                            {assetToken.symbol}
                        </TextButton>

                        <Input
                            type={"number"}
                            style={{ paddingRight: PIXEL_SIZING.huge }}
                            ref={input => input && input.focus()}
                            placeholder={"0.0"}
                        />
                    </div>
                </InputAndLabel>

                <ContentAndArrow 
                    secondary
                    onClick={() => {
                        setShowTokenSelectMenu(true);
                        setTokenSelectType("ASSET");
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.medium }}>
                        <Text secondary style={{ marginRight: 30 }}>
                            {isBuy ? "Buy" : "Sell"}
                        </Text> 
                        <TokenAndLogo token={assetToken}/>
                    </div>
                </ContentAndArrow>

                <ContentAndArrow 
                    secondary
                    onClick={() => {
                        setShowTokenSelectMenu(true);
                        setTokenSelectType("BASE");
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.medium }}>
                        <Text secondary>{isBuy ? "Pay with" : "Receive"}</Text> 
                        <TokenAndLogo token={baseToken}/>
                    </div>
                </ContentAndArrow>

                <Button style={{ width: "100%", height: PIXEL_SIZING.larger }}>
                    <Text primary style={{ color: "white", fontSize: 15 }}>
                        {isBuy ? "Buy" : "Sell"} {assetToken.name}
                    </Text>
                </Button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.miniscule }}>
                    <Text secondary>{isBuy ? "Cost" : "Receive"}: 100093.23 USDT</Text>
                    <TextButton onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? "Hide" : "Show"} Advanced
                    </TextButton>
                </div>

                {
                    showAdvanced &&
                        <>
                            <InputAndLabel>
                                <Text>Max Slippage</Text>
                                <div>
                                    <SlippageSelect/>
                                </div>
                            </InputAndLabel>
                        </>
                }
            </div>
    );
};