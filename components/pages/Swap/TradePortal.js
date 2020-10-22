import Text from "../../core/Text"
import { CONTAINER_SIZING, PIXEL_SIZING, parseTokenAmount, FEE_RATE } from "../../../utils";
import styled, { ThemeContext } from "styled-components";
import { useState, useContext, useEffect } from "react";
import { ContentAndArrow } from "../../core/ContentAndArrow";
import { TokenPairContext } from "../../../context/TokenPair";
import { TokenAndLogo } from "../../core/TokenAndLogo";
import { TextButton, Button } from "../../core/Button";
import { Input } from "../../core/Input";
import { InputAndLabel } from "../../core/InputAndLabel";
import { TokenSelectMenu } from "../../layout/NavBar/AppNavBar";
import { TokenAmountInput } from "../../core/TokenAmountInput";
import { AccountContext } from "../../../context/Account";
import { SwapContext } from "./Swap";
import { NotificationsContext } from "../../../context/Notifications";
import ethers from "ethers";


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
                            return <TradeTab isBuy key={false}/>;
                        case "SELL":
                            return <TradeTab key={true}/>;
                        default:
                            return <PoolTab/>
                    }
                })()
            }
            
        </Container>
    );
};

const PoolTab = () => {
    const { assetToken, baseToken, setAssetToken, setBaseToken, token0, token1 } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { 
        exchangeContract, 
        price,
        exchangeHasAllowance,
        approveExchange,
        exchangeBaseTokenBalance,
        exchangeAssetTokenBalance,
        liquidityToken,
        account,
    } = useContext(SwapContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [baseTokenAmount, setBaseTokenAmount] = useState();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [slippageValue, setSlippageValue] = useState(0.1);
    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
    const [isDepositLoading, setIsDepositLoading] = useState(false);
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center" }}>
                    <Text>Amount to Pool</Text>
                    <TextButton
                        style={{ marginRight: PIXEL_SIZING.tiny }}
                        onClick={() => {
                            setBaseTokenAmount(parseFloat(baseTokenBalance));
                            setAssetTokenAmount((price * parseFloat(baseTokenBalance)));
                        }}
                    >
                        Max Deposit
                    </TextButton>
                    <TextButton
                        onClick={() => {
                            setBaseTokenAmount(parseFloat(account.depositedBaseTokenAmount));
                            setAssetTokenAmount(parseFloat(account.depositedAssetTokenAmount));
                        }}
                    >
                        Max Withdraw
                    </TextButton>
                </div>

                <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
                    <TokenAmountInput
                        onChange={e => {
                            setAssetTokenAmount(e.target.value);
                            setBaseTokenAmount(e.target.value / price);
                        }}
                        value={assetTokenAmount}
                        token={assetToken}
                    />

                    <TokenAmountInput
                        onChange={e => {
                            setBaseTokenAmount(e.target.value);
                            setAssetTokenAmount(e.target.value * price);
                        }}
                        value={baseTokenAmount}
                        token={baseToken}
                    />
                </div>

                <Button 
                    style={{ width: "100%", height: PIXEL_SIZING.larger }}
                    requiresWallet
                    isLoading={isDepositLoading}
                    onClick={async () => {
                        setIsDepositLoading(true);
                        try {
                            const [token0Amount, token1Amount] = baseToken.address === token0.address ?
                                [baseTokenAmount, assetTokenAmount]
                                : [assetTokenAmount, baseTokenAmount];
    
                            await approveExchange(baseToken, assetToken);

                            const slippagePercentage = slippageValue / 100;
                            await addTransactionNotification({
                                content: `Deposit ${assetTokenAmount} ${assetToken.symbol} and ${baseTokenAmount} ${baseToken.symbol} to the liquidity pool`,
                                transactionPromise: exchangeContract.mint_liquidity(
                                    parseTokenAmount(token0Amount, token0),
                                    parseTokenAmount(token1Amount * (1 - slippagePercentage), token1),
                                    parseTokenAmount(token1Amount * (1 + slippagePercentage), token1),
                                    address,
                                    0,
                                    { gasLimit: 450_000 }
                                )
                            });
                        } finally {
                            setIsDepositLoading(false);
                        }
                    }}
                >
                    <Text primary style={{ color: "white", fontSize: 15 }}>
                        Deposit Liquidity
                    </Text>
                </Button>

                <Button 
                    secondary 
                    requiresWallet
                    style={{ width: "100%", height: PIXEL_SIZING.larger }}
                    isLoading={isWithdrawLoading}
                    onClick={async () => {
                        setIsWithdrawLoading(true);
                        try {
                            await approveExchange(liquidityToken);
    
                            const liquidityTokenAmount = (account.liquidityTokenBalance * baseTokenAmount) / account.depositedBaseTokenAmount;
                            await addTransactionNotification({
                                content: `Withdraw ${parseFloat(assetTokenAmount).toFixed(4)} ${assetToken.symbol} and ${parseFloat(baseTokenAmount).toFixed(4)} ${baseToken.symbol} from the liquidity pool`,
                                transactionPromise: exchangeContract.burn_liquidity(
                                    parseTokenAmount(liquidityTokenAmount, { decimals: 18 }),
                                    0,
                                    { gasLimit: 350_000 }
                                )
                            });
                        } finally {
                            setIsWithdrawLoading(false);
                        }
                    }}
                >
                    <Text primary style={{ color: "white", fontSize: 15 }}>
                        Withdraw Liquidity
                    </Text>
                </Button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.miniscule }}>
                    <Text secondary>1 {assetToken.symbol} = {(1 / price).toFixed(4)} {baseToken.symbol}</Text>

                    <TextButton onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? "Hide" : "Show"} Advanced
                    </TextButton>
                </div>

                {
                    showAdvanced &&
                        <InputAndLabel>
                            <Text>Max Slippage</Text>
                            <div>
                                <SlippageSelect 
                                    value={slippageValue}
                                    onChange={value => setSlippageValue(value)}
                                />
                            </div>
                        </InputAndLabel>
                }
            </div>
    );
};

const SlippageOption = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 2px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    height: ${CONTAINER_SIZING.microscopic};
    display: grid;
    align-content: center;
    justify-content: center;
    transition: all 0.08s ease-out;

    &:hover {
        cursor: pointer;
        border: 2px solid ${({ theme }) => theme.colors.primary};
    }
`;

const SlippageSelect = ({ onChange, value }) => {
    const OPTIONS = [0.1, 0.75, 3];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", justifyItems: "center", columnGap: PIXEL_SIZING.small }}>
            {
                OPTIONS.map(option => 
                    <SlippageOption 
                        style={{ width: "100%", textAlign: "center" }}
                        selected={value === option}
                        onClick={() => onChange(option)}
                    >
                        <div style={{ height: "fit-content" }}>{option}%</div>
                    </SlippageOption>
                )
            }

            <Input
                style={{ width: CONTAINER_SIZING.miniscule }}
                onChange={e => onChange(e.target.value)}
                selected={!OPTIONS.includes(value)}
                placeholder={value + "%"}
            />
        </div>
    );
};

// I am paying 5 tokens, how much will i receive for them?
const inputToOutputAmount = (inputAmount, inputBalance, outputBalance, feeRate) => {
    const fee = parseFloat(inputAmount) * feeRate;
    return ((parseFloat(inputAmount) - fee) * parseFloat(outputBalance)) / (parseFloat(inputBalance) + parseFloat(inputAmount) - fee)
}

// I want 10 tokens, how much do i have to pay for them?
const outputToInputAmount = (outputAmount, inputBalance, outputBalance, feeRate) => {
    const amount = parseFloat(outputAmount) * parseFloat(inputBalance) / ((parseFloat(outputBalance) - parseFloat(outputAmount)) * (1 - feeRate));
    return amount >= 0 ? amount : Infinity;
}

const TradeTab = ({ isBuy }) => {
    const { assetToken, baseToken, setAssetToken, setBaseToken, token0 } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { exchangeContract, price, exchangeAssetTokenBalance, exchangeBaseTokenBalance, exchangeHasAllowance, approveExchange } = useContext(SwapContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [slippageValue, setSlippageValue] = useState(0.1);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useContext(ThemeContext);

    console.log("exchange base balance", parseFloat(exchangeBaseTokenBalance))
    console.log("exchange asset balance", exchangeAssetTokenBalance)
    console.log("account base balanec", baseTokenBalance)
    console.log("b", outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE))

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
                        <TextButton
                            style={{ marginRight: PIXEL_SIZING.tiny }}
                            onClick={() => {
                                setAssetTokenAmount(isBuy ? 
                                    inputToOutputAmount(baseTokenBalance - baseTokenBalance * 0.0001, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE) 
                                    : assetTokenBalance
                                );
                            }}
                        >
                            Max
                        </TextButton>
                    </div>

                    <TokenAmountInput
                        token={assetToken}
                        type={"number"}
                        isError={assetTokenAmount && (isBuy ?
                            parseFloat(baseTokenBalance) < outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE)
                            : parseFloat(assetTokenBalance) < parseFloat(assetTokenAmount))
                        }
                        errorMessage={"Insufficient balance"}
                        onChange={e => setAssetTokenAmount(e.target.value)}
                        ref={input => input && input.focus()}
                        value={assetTokenAmount}
                        placeholder={"0.0"}
                    />
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

                <Button 
                    style={{ width: "100%", height: PIXEL_SIZING.larger }}
                    requiresWallet
                    isLoading={isLoading}
                    isDisabled={assetTokenAmount && (isBuy ?
                        parseFloat(baseTokenBalance) < outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE)
                        : parseFloat(assetTokenBalance) < parseFloat(assetTokenAmount))
                    }
                    onClick={async () => {
                        setIsLoading(true);
                        try {   
                            const slippagePercentage = slippageValue / 100;
                            const sendToken = isBuy ? baseToken : assetToken;
                            const receiveToken = isBuy ? assetToken : baseToken;
                            const sendAmount = isBuy ? 
                                outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE) 
                                : assetTokenAmount;
                            const receiveAmount = isBuy ? 
                                assetTokenAmount 
                                : inputToOutputAmount(assetTokenAmount, exchangeAssetTokenBalance, exchangeBaseTokenBalance, FEE_RATE);
    
                            await approveExchange(sendToken);
                            await addTransactionNotification({
                                content: `${isBuy ? "Buy" : "Sell"} ${assetTokenAmount} ${assetToken.symbol} ${isBuy ? "with" : "for"} ${isBuy ? sendAmount.toFixed(4) : receiveAmount.toFixed(4)} ${baseToken.symbol}`,
                                transactionPromise: exchangeContract.swap(
                                    sendToken.address,
                                    parseTokenAmount(sendAmount, sendToken), 
                                    address,
                                    parseTokenAmount(receiveAmount * (1 - slippagePercentage), receiveToken),
                                    parseTokenAmount(receiveAmount * (1 + slippagePercentage), receiveToken),
                                    0,
                                    ethers.constants.AddressZero, 
                                    { gasLimit: 450_000 },
                                ),
                            });
                        } finally {
                            setIsLoading(false);
                        }
                    }}    
                >
                    <Text primary style={{ color: "white", fontSize: 15 }}>
                        {isBuy ? "Buy" : "Sell"} {assetToken.name}
                    </Text>
                </Button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.miniscule }}>
                    <Text secondary>
                        {isBuy ? "Cost" : "Receive"}: {
                            isBuy ?
                                outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE).toFixed(4)
                                : inputToOutputAmount(assetTokenAmount, exchangeAssetTokenBalance, exchangeBaseTokenBalance, FEE_RATE).toFixed(4)
                        } {baseToken.symbol}
                    </Text>
                    <TextButton onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? "Hide" : "Show"} Advanced
                    </TextButton>
                </div>

                {
                    showAdvanced &&
                        <InputAndLabel>
                            <Text>Max Slippage</Text>
                            <div>
                                <SlippageSelect 
                                    value={slippageValue}
                                    onChange={value => setSlippageValue(value)}
                                />
                            </div>
                        </InputAndLabel>
                }
            </div>
    );
};