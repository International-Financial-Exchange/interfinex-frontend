import { Card } from "../../core/Card"
import { CONTAINER_SIZING, PIXEL_SIZING, IMEB_TOKEN } from "../../../utils"
import Text from "../../core/Text"
import Button, { TextButton } from "../../core/Button"
import { TokenAmountInput } from "../../core/TokenAmountInput"
import { useContext, useState } from "react"
import { TokenPairContext } from "../../../context/TokenPair"

export const CreateMarket = () => {
    const { token0, token1, assetToken, baseToken } = useContext(TokenPairContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [baseTokenAmount, setBaseTokenAmount] = useState();
    const [imebTokenAmount, setImebTokenAmount] = useState();

    return (
        <Card style={{ width: CONTAINER_SIZING.medium, padding: PIXEL_SIZING.medium, display: "grid", rowGap: PIXEL_SIZING.small }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center" }}>
                <Text>Amount of Liquidity</Text>
                <TextButton text style={{ marginRight: PIXEL_SIZING.tiny }}>Max</TextButton>
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
                value={imebTokenAmount}
                onChange={e => setImebTokenAmount(e.target.value)}
                token={IMEB_TOKEN}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                <Text secondary>
                    1 {baseToken.symbol} ≈ {Number.isNaN(assetTokenAmount / baseTokenAmount) ? 0 : (assetTokenAmount / baseTokenAmount).toFixed(4)} {assetToken.symbol}
                </Text>

                <Text secondary>1 {baseToken.symbol} ≈ {Number.isNaN(imebTokenAmount / (baseTokenAmount / 10)) ? 0 : (imebTokenAmount / (baseTokenAmount / 10)).toFixed(4)} {IMEB_TOKEN.symbol}</Text>
            </div>

            <Button style={{ height: PIXEL_SIZING.larger, width: "100%" }}>
                Create Swap Market
            </Button>
        </Card>
    )
}