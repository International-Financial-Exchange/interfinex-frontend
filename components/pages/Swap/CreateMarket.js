import { Card } from "../../core/Card"
import { CONTAINER_SIZING, PIXEL_SIZING, } from "../../../utils"
import Text from "../../core/Text"
import Button, { TextButton } from "../../core/Button"
import { TokenAmountInput } from "../../core/TokenAmountInput"
import { useContext, useState, useCallback } from "react"
import { TokenPairContext } from "../../../context/TokenPair"
import { AccountContext } from "../../../context/Account"
import { EthersContext } from "../../../context/Ethers"

export const CreateMarket = () => {
    const { token0, token1, assetToken, baseToken, imebToken } = useContext(TokenPairContext);
    const { assetTokenBalance, baseTokenBalance, imebTokenBalance } = useContext(AccountContext);
    const { contracts: { factoryContract }} = useContext(EthersContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [baseTokenAmount, setBaseTokenAmount] = useState();
    const [imebTokenAmount, setImebTokenAmount] = useState();

    const onSubmit = async () => {
        // create the market
        console.log(token0.address, token1.address)
        const tx = await factoryContract.create_exchange(token0.address, token1.address);
        console.log("res", tx);
        // const exchangeAddress = await factoryContract.pair_to_exchange(token0.address, token1.address);
        // exchange = await Exchange.at(exchangeAddress);
        // deposit 90% liquidity into market
        // deposit 5% liquidity into the asset/imeb market
        // deposit 5$ into the base/imeb market
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
                        setImebTokenAmount(imebTokenBalance);
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
                value={imebTokenAmount}
                onChange={e => setImebTokenAmount(e.target.value)}
                token={imebToken}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                <Text secondary>
                    1 {baseToken.symbol} ≈ {Number.isNaN(assetTokenAmount / baseTokenAmount) ? 0 : (assetTokenAmount / baseTokenAmount).toFixed(4)} {assetToken.symbol}
                </Text>

                <Text secondary>1 {baseToken.symbol} ≈ {Number.isNaN(imebTokenAmount / (baseTokenAmount / 10)) ? 0 : (imebTokenAmount / (baseTokenAmount / 10)).toFixed(4)} {imebToken.symbol}</Text>
            </div>

            <Button 
                style={{ height: PIXEL_SIZING.larger, width: "100%" }}
                onClick={onSubmit}
            >
                Create Swap Market
            </Button>
        </Card>
    )
}