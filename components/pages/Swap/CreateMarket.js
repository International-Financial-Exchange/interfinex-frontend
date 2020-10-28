import { Card } from "../../core/Card"
import { CONTAINER_SIZING, PIXEL_SIZING, } from "../../../utils"
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

export const CreateMarket = () => {
    const { token0, token1, assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, ifexTokenBalance } = useContext(AccountContext);
    const { contracts: { factoryContract }} = useContext(EthersContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const { approveFactory } = useContext(SwapContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [baseTokenAmount, setBaseTokenAmount] = useState();
    const [ifexTokenAmount, setIfexTokenAmount] = useState();

    const onSubmit = async () => {
        console.log(
            "contracts",
            token0.address,
            token1.address,
            ifexToken.address
        );
        
        await approveFactory();
        
        console.log(baseToken.address, 
            assetToken.address,
            ethers.utils.parseUnits(baseTokenAmount.toString(), baseToken.decimals).toString(),
            ethers.utils.parseUnits(assetTokenAmount.toString(), assetToken.decimals).toString(),
            ethers.utils.parseUnits(ifexTokenAmount.toString(), ifexToken.decimals).toString(),);

            // return;

            
        addTransactionNotification({
            content: `Create swap market for ${assetToken.name} and ${baseToken.name}`,
            transactionPromise: factoryContract.create_exchange(
                baseToken.address, 
                assetToken.address,
                ethers.utils.parseUnits(baseTokenAmount.toString(), baseToken.decimals).toString(),
                ethers.utils.parseUnits(assetTokenAmount.toString(), assetToken.decimals).toString(),
                ethers.utils.parseUnits(ifexTokenAmount.toString(), ifexToken.decimals).toString(),
                { gasLimit: 3_000_000 }
            ),
        });
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
                onChange={e => setAssetTokenAmount(e.target.value)}
                token={assetToken}
            />

            <TokenAmountInput 
                value={baseTokenAmount}
                onChange={e => setBaseTokenAmount(e.target.value)}
                token={baseToken}
            />

            <TokenAmountInput 
                value={ifexTokenAmount}
                onChange={e => setIfexTokenAmount(e.target.value)}
                token={ifexToken}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                <Text secondary>
                    1 {baseToken.symbol} ≈ {Number.isNaN(assetTokenAmount / baseTokenAmount) ? 0 : (assetTokenAmount / baseTokenAmount).toFixed(4)} {assetToken.symbol}
                </Text>

                <Text secondary>1 {baseToken.symbol} ≈ {Number.isNaN(ifexTokenAmount / (baseTokenAmount / 10)) ? 0 : (ifexTokenAmount / (baseTokenAmount / 10)).toFixed(4)} {ifexToken.symbol}</Text>
            </div>

            <Button 
                style={{ height: PIXEL_SIZING.larger, width: "100%" }}
                requiresWallet
                onClick={onSubmit}
            >
                Create Swap Market
            </Button>
        </Card>
    )
}