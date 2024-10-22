import { parseEther } from "ethers/lib/utils";
import { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext } from "../../../../context/Notifications";
import { TokenPairContext } from "../../../../context/TokenPair";
import { PIXEL_SIZING } from "../../../../utils/constants";
import { parseTokenAmount, safeParseEther } from "../../../../utils/utils";
import { Button, TextButton } from "../../../core/Button";
import { InputAndLabel } from "../../../core/InputAndLabel";
import { SlippageSelect } from "../../../core/SlippageSelect";
import Text from "../../../core/Text";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { TokenSelectMenu } from "../../../layout/NavBar/AppNavBar";
import { SwapContext } from "../Swap";
import Big from "big.js";

export const Pool = () => {
    const { assetToken, baseToken, setAssetToken, setBaseToken, token0, token1 } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { contracts: { SwapEthRouter, YieldFarm }} = useContext(EthersContext);
    const { 
        exchangeContract, 
        assetTokensPerBaseToken,
        exchangeHasAllowance,
        approveExchange,
        exchangeBaseTokenBalance,
        exchangeAssetTokenBalance,
        approveRouter,
        liquidityToken,
        account,
    } = useContext(SwapContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState(false);
    const [tokenSelectType, setTokenSelectType] = useState("");
    const [assetTokenAmount, setAssetTokenAmount] = useState(new Big(0));
    const [baseTokenAmount, setBaseTokenAmount] = useState(new Big(0));
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [slippageValue, setSlippageValue] = useState(0.75);
    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
    const [isDepositLoading, setIsDepositLoading] = useState(false);
    const theme = useContext(ThemeContext);

    console.log(exchangeBaseTokenBalance.toString(),
        exchangeAssetTokenBalance.toString(),);
    console.log("price", baseTokenAmount.toString(), assetTokenAmount.toString());

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
                        requiresWallet
                        style={{ marginRight: PIXEL_SIZING.tiny }}
                        onClick={() => {
                            if (baseTokenBalance.mul(assetTokensPerBaseToken).lt(assetTokenBalance)) {
                                setBaseTokenAmount(baseTokenBalance);
                                setAssetTokenAmount(assetTokensPerBaseToken.mul(baseTokenBalance));
                            } else {
                                setBaseTokenAmount(assetTokenBalance.div(assetTokensPerBaseToken));
                                setAssetTokenAmount(assetTokenBalance);
                            }
                        }}
                    >
                        Max Deposit
                    </TextButton>
                    <TextButton
                        requiresWallet
                        onClick={() => {
                            setBaseTokenAmount(account.depositedBaseTokenAmount);
                            setAssetTokenAmount(account.depositedAssetTokenAmount);
                        }}
                    >
                        Max Withdraw
                    </TextButton>
                </div>

                <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
                    <TokenAmountInput
                        onChange={num => {
                            setAssetTokenAmount(num);                            
                            setBaseTokenAmount(num.div(assetTokensPerBaseToken));
                        }}
                        value={assetTokenAmount}
                        token={assetToken}
                    />

                    <TokenAmountInput
                        onChange={num => {
                            setBaseTokenAmount(num);
                            setAssetTokenAmount(num.mul(assetTokensPerBaseToken));
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
                            if (assetToken.name === "Ethereum" || baseToken.name === "Ethereum") {
                                const [etherToken, sendToken] = assetToken.name === "Ethereum" ? [assetToken, baseToken] : [baseToken, assetToken];
                                const [etherTokenAmount, sendTokenAmount] = sendToken.address === assetToken.address ? 
                                    [baseTokenAmount, assetTokenAmount] 
                                    : [assetTokenAmount, baseTokenAmount];
    
                                await approveRouter(sendToken);

                                const slippagePercentage = slippageValue / 100;
                            
                                console.log(
                                    sendToken?.address,
                                        parseTokenAmount(sendTokenAmount.mul(1 - slippagePercentage), sendToken),
                                        parseTokenAmount(sendTokenAmount.mul(1 + slippagePercentage), sendToken),
                                        address,
                                        0,
                                        { value: safeParseEther(etherTokenAmount.toString()) }
                                );

                                await addTransactionNotification({
                                    content: `Deposit ${assetTokenAmount.toFixed(4)} ${assetToken.symbol} and ${baseTokenAmount.toFixed(4)} ${baseToken.symbol} to the liquidity pool`,
                                    transactionPromise: SwapEthRouter.mint_liquidity(
                                        sendToken?.address,
                                        parseTokenAmount(sendTokenAmount.mul(1 - (slippagePercentage * 2)), sendToken),
                                        parseTokenAmount(sendTokenAmount, sendToken),
                                        address,
                                        0,
                                        { gasLimit: 450_000, value: safeParseEther(etherTokenAmount.toString()) }
                                    )
                                });
                            } else {
                                await approveExchange(baseToken, assetToken);
                                
                                const slippagePercentage = slippageValue / 100;
                                await addTransactionNotification({
                                    content: `Deposit ${assetTokenAmount} ${assetToken.symbol} and ${baseTokenAmount} ${baseToken.symbol} to the liquidity pool`,
                                    transactionPromise: exchangeContract.mint_liquidity(
                                        assetToken.address,
                                        parseTokenAmount(assetTokenAmount, assetToken),
                                        parseTokenAmount(sendTokenAmount.mul(1 - (slippagePercentage * 2)), sendToken),
                                        parseTokenAmount(baseTokenAmount, baseToken),
                                        address,
                                        0,
                                        { gasLimit: 450_000 }
                                    )
                                });
                            }
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
                            await YieldFarm.harvest(liquidityToken.address);
                            if (assetToken.name === "Ethereum" || baseToken.name === "Ethereum") {
                                const [etherToken, sendToken] = assetToken.name === "Ethereum" ? [assetToken, baseToken] : [baseToken, assetToken];
                                const liquidityTokenAmount = account.liquidityTokenBalance.mul(baseTokenAmount).div(account.depositedBaseTokenAmount);

                                await approveRouter(liquidityToken);

                                await addTransactionNotification({
                                    content: `Withdraw ${assetTokenAmount.toFixed(4)} ${assetToken.symbol} and ${baseTokenAmount.toFixed(4)} ${baseToken.symbol} from the liquidity pool`,
                                    transactionPromise: SwapEthRouter.burn_liquidity(
                                        sendToken.address,
                                        parseTokenAmount(liquidityTokenAmount, { decimals: 18 }),
                                        0,
                                        { gasLimit: 550_000 }
                                    )
                                });
                            } else {
                                await approveExchange(liquidityToken);
        
                                const liquidityTokenAmount =  account.liquidityTokenBalance.mul(baseTokenAmount).div(account.depositedBaseTokenAmount);
                                await addTransactionNotification({
                                    content: `Withdraw ${assetTokenAmount.toFixed(4)} ${assetToken.symbol} and ${baseTokenAmount.toFixed(4)} ${baseToken.symbol} from the liquidity pool`,
                                    transactionPromise: exchangeContract.burn_liquidity(
                                        parseTokenAmount(liquidityTokenAmount, { decimals: 18 }),
                                        0,
                                        { gasLimit: 350_000 }
                                    )
                                });
                            }
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
                    <Text secondary>1 {assetToken.symbol} = {(1 / assetTokensPerBaseToken).toFixed(4)} {baseToken.symbol}</Text>

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