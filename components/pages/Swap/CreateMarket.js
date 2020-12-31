import { Card } from "../../core/Card"
import Text from "../../core/Text"
import { TextButton, Button } from "../../core/Button"
import { TokenAmountInput } from "../../core/TokenAmountInput"
import { useContext, useState, useCallback } from "react"
import { TokenPairContext } from "../../../context/TokenPair"
import { AccountContext } from "../../../context/Account"
import { EthersContext } from "../../../context/Ethers"
import ethers from "ethers";
import { NotificationsContext } from "../../../context/Notifications"
import { SwapContext } from "./Swap"
import { parseEther } from "ethers/lib/utils"
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants"
import { divOrZero, safeParseEther } from "../../../utils/utils";
import Big from "big.js";

export const CreateMarket = () => {
    const { token0, token1, assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, ifexTokenBalance } = useContext(AccountContext);
    const { contracts: { SwapFactory, SwapEthRouter }} = useContext(EthersContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const { approveFactory, approveRouter } = useContext(SwapContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState(new Big(0));
    const [baseTokenAmount, setBaseTokenAmount] = useState(new Big(0));
    const [ifexTokenAmount, setIfexTokenAmount] = useState(new Big(0));

    const [isLoading, setIsLoading] = useState();

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            if (assetToken.name === "Ethereum" || baseToken.name === "Ethereum") {
                const [etherToken, sendToken] = assetToken.name === "Ethereum" ? [assetToken, baseToken] : [baseToken, assetToken];
                const [etherTokenAmount, sendTokenAmount] = sendToken.address === assetToken.address ? 
                    [baseTokenAmount, assetTokenAmount] 
                    : [assetTokenAmount, baseTokenAmount];
                
                await approveRouter(sendToken, ifexToken);
    
                addTransactionNotification({
                    content: `Create swap market for ${assetToken.name} and ${baseToken.name}`,
                    transactionPromise: SwapEthRouter.create_exchange(
                        sendToken.address, 
                        ethers.utils.parseUnits(sendTokenAmount.toString(), sendToken.decimals).toString(),
                        ethers.utils.parseUnits(ifexTokenAmount.toString(), ifexToken.decimals).toString(),
                        { gasLimit: 4_500_000, value: safeParseEther(etherTokenAmount.toString()) }
                    ),
                });
            } else {
                await approveFactory();
    
                addTransactionNotification({
                    content: `Create swap market for ${assetToken.name} and ${baseToken.name}`,
                    transactionPromise: SwapFactory.create_exchange(
                        baseToken.address, 
                        assetToken.address,
                        ethers.utils.parseUnits(baseTokenAmount.toString(), baseToken.decimals).toString(),
                        ethers.utils.parseUnits(assetTokenAmount.toString(), assetToken.decimals).toString(),
                        ethers.utils.parseUnits(ifexTokenAmount.toString(), ifexToken.decimals).toString(),
                        { gasLimit: 4_500_000 }
                    ),
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card style={{ width: CONTAINER_SIZING.medium, padding: PIXEL_SIZING.medium, display: "grid", rowGap: PIXEL_SIZING.small }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center" }}>
                <Text>Amount of Liquidity</Text>
                <TextButton 
                    style={{ marginRight: PIXEL_SIZING.tiny }}
                    onClick={() => {
                        setAssetTokenAmount(assetTokenBalance);
                        setBaseTokenAmount(baseTokenBalance);
                        setIfexTokenAmount(ifexTokenBalance);
                    }}
                >
                    Max
                </TextButton>
            </div>

            <TokenAmountInput 
                value={assetTokenAmount}
                isError={assetTokenAmount.gt(assetTokenBalance)}
                errorMessage={`Insufficent ${assetToken.symbol} balance`}
                onChange={num => setAssetTokenAmount(num)}
                token={assetToken}
            />

            <TokenAmountInput 
                value={baseTokenAmount}
                isError={baseTokenAmount.gt(baseTokenBalance)}
                errorMessage={`Insufficent ${baseToken.symbol} balance`}
                onChange={num => setBaseTokenAmount(num)}
                token={baseToken}
            />

            <TokenAmountInput 
                value={ifexTokenAmount}
                isError={ifexTokenAmount.gt(ifexTokenBalance)}
                errorMessage={`Insufficent ${ifexToken.symbol} balance`}
                onChange={num => setIfexTokenAmount(num)}
                token={ifexToken}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                <Text secondary>
                    1 {baseToken.symbol} ≈ {divOrZero(assetTokenAmount, baseTokenAmount).toFixed(6)} {assetToken.symbol}
                </Text>

                <Text secondary>1 {baseToken.symbol} ≈ {divOrZero(ifexTokenAmount, divOrZero(baseTokenAmount, new Big(10))).toFixed(6)} {ifexToken.symbol}</Text>
            </div>

            <Button 
                style={{ height: PIXEL_SIZING.larger, width: "100%" }}
                requiresWallet
                isLoading={isLoading}
                onClick={onSubmit}
            >
                Create Swap Market
            </Button>
        </Card>
    )
}