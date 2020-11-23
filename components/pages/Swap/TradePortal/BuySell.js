import { ethers } from "ethers";
import { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { NotificationsContext } from "../../../../context/Notifications";
import { TokenPairContext } from "../../../../context/TokenPair";
import { FEE_RATE, parseTokenAmount, PIXEL_SIZING } from "../../../../utils";
import { Button, TextButton } from "../../../core/Button";
import { ContentAndArrow } from "../../../core/ContentAndArrow";
import { InputAndLabel } from "../../../core/InputAndLabel";
import { SliderInput } from "../../../core/SliderInput";
import { SlippageSelect } from "../../../core/SlippageSelect";
import Text from "../../../core/Text";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { TokenSelectMenu } from "../../../layout/NavBar/AppNavBar";
import { MarginContext, SwapContext } from "../Swap";


// I am paying 5 tokens, how much will i receive for them?
export const inputToOutputAmount = (inputAmount, inputBalance, outputBalance, feeRate) => {
    const fee = parseFloat(inputAmount) * feeRate;
    return ((parseFloat(inputAmount) - fee) * parseFloat(outputBalance)) / (parseFloat(inputBalance) + parseFloat(inputAmount) - fee)
}

// I want 10 tokens, how much do i have to pay for them?
const outputToInputAmount = (outputAmount, inputBalance, outputBalance, feeRate) => {
    const amount = parseFloat(outputAmount) * parseFloat(inputBalance) * (1 - feeRate) / ((parseFloat(outputBalance) - parseFloat(outputAmount)) * (1 - feeRate));
    return amount >= 0 ? amount : Infinity;
}

export const BuySell = ({ isBuy, isMargin }) => {
    const { assetToken, baseToken, setAssetToken, setBaseToken, token0 } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { 
        exchangeContract, 
        price, 
        exchangeAssetTokenBalance, 
        exchangeBaseTokenBalance, 
        exchangeHasAllowance, 
        approveExchange,
    } = useContext(SwapContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [slippageValue, setSlippageValue] = useState(0.1);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useContext(ThemeContext);
    
    // Margin trading variables
    const { parameters: _parameters, marginMarkets, approveMarginMarket } = useContext(MarginContext);
    const parameters = _parameters?.[marginMarkets?.[isBuy ? baseToken.address : assetToken.address]?.address];
    const [leverage, setLeverage] = useState(0);
    const maxLeverage = (1 / parameters?.minInitialMarginRate).toFixed(1);
    
    const inverseAmount = outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE);
    const initialMargin = isBuy ? 
        inverseAmount / (leverage + 1) 
        : assetTokenAmount / (leverage + 1);
    const borrowAmount = isBuy ?
        inverseAmount - initialMargin
        : assetTokenAmount - initialMargin;
    const maintenanceMargin = borrowAmount * parameters?.maintenanceMarginRate;
    const totalMargin = initialMargin + maintenanceMargin;

    const spotTrade = async () => {
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
                    false,
                    { gasLimit: 500_000 },
                ),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const marginTrade = async () => {
        setIsLoading(true);
        try {   
            const slippagePercentage = slippageValue / 100;
            const [sendToken, receiveToken] = isBuy ? [baseToken, assetToken] : [assetToken, baseToken];
            const MarginMarket = marginMarkets[sendToken.address];
            const approve = approveMarginMarket[sendToken.address];

            const receiveAmount = isBuy ? 
                assetTokenAmount
                : inputToOutputAmount(assetTokenAmount, exchangeAssetTokenBalance, exchangeBaseTokenBalance, FEE_RATE);
            
            console.log("total margin", initialMargin + maintenanceMargin);
            console.log("initial margin", initialMargin);
            console.log("maintenance margin", maintenanceMargin);
            console.log("borrow amount", borrowAmount);
            
            await approve(sendToken);
            await addTransactionNotification({
                content: `${isBuy ? "Margin Buy" : "Margin Sell"} ${assetTokenAmount} ${assetToken.symbol} with ${leverage} ${isBuy ? "with" : "for"} ${isBuy ? initialMargin + borrowAmount : receiveAmount.toFixed(4)} ${baseToken.symbol}`,
                transactionPromise: MarginMarket.increasePosition(
                    parseTokenAmount(initialMargin + maintenanceMargin, sendToken),
                    parseTokenAmount(borrowAmount, sendToken), 
                    parseTokenAmount(receiveAmount * (1 - slippagePercentage), receiveToken),
                    parseTokenAmount(receiveAmount * (1 + slippagePercentage), receiveToken),
                    0,
                    false,
                    { gasLimit: 500_000 },
                ),
            });
        } finally {
            setIsLoading(false);
        }
    };
    
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
                            requiresWallet
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

                {
                    isMargin &&
                        <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, marginTop: PIXEL_SIZING.small }}>
                            <Text>Leverage: {leverage}x</Text>
                            <SliderInput 
                                valueLabelFormat={value => `${value}x`}
                                step={0.1}
                                onChange={(_, value) => setLeverage(value)}
                                max={maxLeverage}
                                marks={[{ value: 0, label: "0x",}, { value: 100, label: "100x",}]} 
                            />
                        </div>
                }

                <Button
                    style={{ width: "100%", height: PIXEL_SIZING.larger }}
                    requiresWallet
                    isLoading={isLoading}
                    isDisabled={assetTokenAmount && (isBuy ?
                        parseFloat(baseTokenBalance) < outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE)
                        : parseFloat(assetTokenBalance) < parseFloat(assetTokenAmount))
                    }
                    onClick={() => {
                        if (isMargin) marginTrade();
                        else spotTrade();
                    }}    
                >
                    <Text primary style={{ color: "white", fontSize: 15 }}>
                        {isBuy ? "Buy" : "Sell"} {assetToken.name}
                    </Text>
                </Button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.miniscule }}>
                    {
                        isMargin ?
                            <Text secondary>
                                Cost {totalMargin.toFixed(4)} {isBuy ? baseToken.symbol : assetToken.symbol}
                            </Text>
                            : <Text secondary>
                                {isBuy ? "Cost" : "Receive"}: {
                                    isBuy ?
                                        outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE).toFixed(4)
                                        : inputToOutputAmount(assetTokenAmount, exchangeAssetTokenBalance, exchangeBaseTokenBalance, FEE_RATE).toFixed(4)
                                } {baseToken.symbol}
                            </Text>
                    }

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