import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { max } from "lodash";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext } from "../../../../context/Notifications";
import { TokenPairContext } from "../../../../context/TokenPair";
import { FEE_RATE, PIXEL_SIZING } from "../../../../utils/constants";
import { parseTokenAmount, safeParseEther } from "../../../../utils/utils";
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
import Big from "big.js";

// I am paying 5 tokens, how much will i receive for them?
export const inputToOutputAmount = (inputAmount = Big(0), inputBalance = Big(0), outputBalance = Big(0), feeRate) => {
    if ([inputAmount, inputBalance, outputBalance,].some(b => b.lte(0))) 
        return new Big(0);

    const fee = inputAmount.mul(feeRate);
    return inputAmount
        .sub(fee)
        .mul(outputBalance)
        .div(inputBalance.add(inputAmount).sub(fee))
}

// I want 10 tokens, how much do i have to pay for them?
const outputToInputAmount = (outputAmount = Big(0), inputBalance = Big(0), outputBalance = Big(0), feeRate) => {
    if ([outputAmount, inputBalance, outputBalance,].some(b => b.lte(0))) 
        return new Big(0);

        console.log(outputBalance.toString(), outputAmount.toString(), 1 - feeRate);
    console.log(outputBalance.sub(outputAmount).mul(1 - feeRate).toString());

    const amount = outputAmount
        .mul(inputBalance)
        .mul(1 - feeRate)
        .div(outputBalance.sub(outputAmount).mul(1 - feeRate));

    return amount.gt(0) ? amount : new Big(0);
}

export const BuySell = ({ isBuy, isMargin }) => {
    const { assetToken, baseToken, setAssetToken, setBaseToken, token0, token1 } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { contracts: { SwapEthRouter, MarginEthRouter }} = useContext(EthersContext);
    const { 
        exchangeContract, 
        price, 
        exchangeAssetTokenBalance, 
        exchangeBaseTokenBalance, 
        approveRouter,
        exchangeHasAllowance, 
        approveExchange,
    } = useContext(SwapContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [assetTokenAmount, setAssetTokenAmount] = useState(new Big(0));
    const [slippageValue, setSlippageValue] = useState(0.1);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useContext(ThemeContext);
    // const authorizeMarginEthRouter = useAuthorizeContract();
    
    // Margin trading variables
    const { parameters: _parameters, marginMarkets, approveMarginMarket, funding: { stats: _stats }} = useContext(MarginContext);
    const parameters = _parameters?.[marginMarkets?.[isBuy ? baseToken.address : assetToken.address]?.address];
    const fundingStats = _stats?.[marginMarkets?.[isBuy ? baseToken.address : assetToken.address]?.address];
    const [_leverage, setLeverage] = useState();
    const maxLeverage = (1 / (parameters?.minInitialMarginRate ?? 0.5)).toFixed(1);
    const leverage = _leverage ?? maxLeverage / 2;
    
    console.log("error here", [assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance].map(e => e.toString()))
    const inverseAmount = outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE);

    const initialMargin = isBuy ? 
        inverseAmount.div(leverage + 1) 
        : assetTokenAmount.div(leverage + 1);
    const borrowAmount = isBuy ?
        inverseAmount.sub(initialMargin)
        : assetTokenAmount.sub(initialMargin);
    const maintenanceMargin = borrowAmount.mul(parameters?.maintenanceMarginRate ?? 0.5);
    const totalMargin = initialMargin.add(maintenanceMargin);

    const hasSufficientFunding = (fundingStats && parameters && assetTokenAmount > 0) 
        ? borrowAmount.lte(fundingStats.totalValue.mul(parameters.maxBorrowAmountRate)) 
        : true;

    const hasSufficientBalance = !assetTokenAmount || (isMargin ?
            isBuy ?
                baseTokenBalance.gte(totalMargin)
                : assetTokenBalance.gte(totalMargin)
        :
            isBuy ?
                baseTokenBalance.gte(outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE))
                : assetTokenBalance.gte(assetTokenAmount)
    );

    const spotTrade = async () => {
        setIsLoading(true);

        try {   
            if (assetToken.name === "Ethereum" || baseToken.name === "Ethereum") {
                const [etherToken, routerAssetToken] = assetToken.name === "Ethereum" ? [assetToken, baseToken] : [baseToken, assetToken];
                const slippagePercentage = slippageValue / 100;
                const sendToken = isBuy ? baseToken : assetToken;
                const receiveToken = isBuy ? assetToken : baseToken;
                const sendAmount = isBuy ? 
                    outputToInputAmount(assetTokenAmount, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE) 
                    : assetTokenAmount;
    
                const receiveAmount = isBuy ? 
                    assetTokenAmount 
                    : inputToOutputAmount(assetTokenAmount, exchangeAssetTokenBalance, exchangeBaseTokenBalance, FEE_RATE);

                await approveRouter(sendToken);

                await addTransactionNotification({
                    content: `${isBuy ? "Buy" : "Sell"} ${assetTokenAmount} ${assetToken.symbol} ${isBuy ? "with" : "for"} ${isBuy ? sendAmount.toFixed(4) : receiveAmount.toFixed(4)} ${baseToken.symbol}`,
                    transactionPromise: SwapEthRouter.swap(
                        routerAssetToken.address,
                        sendToken.address,
                        parseTokenAmount(sendAmount, sendToken), 
                        address,
                        parseTokenAmount(receiveAmount.mul(1 - slippagePercentage), receiveToken),
                        parseTokenAmount(receiveAmount.mul(1 + slippagePercentage), receiveToken),
                        0,
                        ethers.constants.AddressZero, 
                        false,
                        { gasLimit: 225_000, value: sendToken.name === "Ethereum" ? safeParseEther(sendAmount.toString()) : 0 },
                    ),
                });
            } else {
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
                        parseTokenAmount(receiveAmount.mul(1 - slippagePercentage), receiveToken),
                        parseTokenAmount(receiveAmount.mul(1 + slippagePercentage), receiveToken),
                        0,
                        ethers.constants.AddressZero, 
                        false,
                    ),
                });
            }
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

            if (sendToken.name === "Ethereum") {
                // TODO: Cache this authorization result in a hook somewhere
                const isAuthorized = await MarginMarket.isAuthorized(address, MarginEthRouter.address);
                if (!isAuthorized) {
                    await MarginMarket.authorize(MarginEthRouter.address);
                }

                await addTransactionNotification({
                    content: `${isBuy ? "Margin Buy" : "Margin Sell"} ${assetTokenAmount} ${assetToken.symbol} with ${leverage}x leverage ${isBuy ? "with" : "for"} ${isBuy ? initialMargin.add(borrowAmount).toFixed(4) : receiveAmount.toFixed(4)} ${baseToken.symbol}`,
                    transactionPromise: MarginEthRouter.increasePosition(
                        receiveToken.address,
                        parseTokenAmount(borrowAmount, sendToken), 
                        0,0,
                        0,
                        false,
                        { gasLimit: 500_000, value: safeParseEther(initialMargin.add(maintenanceMargin).toString()) },
                    ),
                });
            } else {
                await approve(sendToken);
                await addTransactionNotification({
                    content: `${isBuy ? "Margin Buy" : "Margin Sell"} ${assetTokenAmount} ${assetToken.symbol} with ${leverage}x leverage ${isBuy ? "with" : "for"} ${isBuy ? initialMargin + borrowAmount : receiveAmount.toFixed(4)} ${baseToken.symbol}`,
                    transactionPromise: MarginMarket.increasePosition(
                        parseTokenAmount(initialMargin.add(maintenanceMargin), sendToken),
                        parseTokenAmount(borrowAmount, sendToken), 
                        parseTokenAmount(receiveAmount.mul(1 - slippagePercentage), receiveToken),
                        parseTokenAmount(receiveAmount.mul(1 + slippagePercentage), receiveToken),
                        0,
                        false,
                        address,
                        { gasLimit: 500_000 },
                    ),
                });
            }
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
                                if (!address) return;

                                console.log("before err", baseTokenBalance.toString(), exchangeBaseTokenBalance.toString(), exchangeAssetTokenBalance.toString())
                                const maxAssetAmount = isMargin ?
                                    isBuy ? 
                                        inputToOutputAmount(baseTokenBalance.mul(leverage + 1), exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE) 
                                        : assetTokenBalance.mul(leverage + 1)
                                :
                                    isBuy ? 
                                        inputToOutputAmount(baseTokenBalance, exchangeBaseTokenBalance, exchangeAssetTokenBalance, FEE_RATE) 
                                        : assetTokenBalance

                                setAssetTokenAmount(maxAssetAmount);
                            }}
                        >
                            Max
                        </TextButton>
                    </div>

                    <TokenAmountInput
                        token={assetToken}
                        type={"number"}
                        isError={!hasSufficientBalance}
                        errorMessage={"Insufficient balance"}
                        onChange={num => setAssetTokenAmount(num)}
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
                                defaultValue={maxLeverage / 2}
                                step={0.1}
                                min={0.1}
                                onChange={(_, value) => setLeverage(value)}
                                max={parseFloat(maxLeverage)}
                                marks={[{ value: 0.1, label: "0.1x",}, { value: maxLeverage, label: `${maxLeverage}x`,}]} 
                            />

                            {
                                !hasSufficientFunding &&
                                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny }}>
                                        <Text error>There is insufficient funding in the market to cover this trade - Reduce the amount or leverage</Text>
                                        <TextButton onClick={() => window.open("https://interfinexio.medium.com/introducing-500x-leveraged-margin-trading-on-every-erc20-token-1994f7fdf418")}>
                                            Read More
                                        </TextButton>
                                    </div>
                            }
                        </div>
                }

                <Button
                    style={{ width: "100%", height: PIXEL_SIZING.larger }}
                    requiresWallet
                    isLoading={isLoading}
                    isDisabled={!hasSufficientBalance || (isMargin && !hasSufficientFunding)}
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
                                Cost: {totalMargin.toFixed(4)} {isBuy ? baseToken.symbol : assetToken.symbol}
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