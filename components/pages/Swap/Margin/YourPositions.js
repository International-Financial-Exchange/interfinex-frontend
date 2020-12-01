import { useContext, useState } from "react"
import Skeleton from "react-loading-skeleton"
import { AccountContext } from "../../../../context/Account"
import { EthersContext } from "../../../../context/Ethers"
import { NotificationsContext } from "../../../../context/Notifications"
import { TokenPairContext } from "../../../../context/TokenPair"
import { CONTAINER_SIZING, FEE_RATE, PIXEL_SIZING } from "../../../../utils/constants"
import { Button } from "../../../core/Button"
import { Card } from "../../../core/Card"
import Text from "../../../core/Text"
import { TextOption } from "../../../core/TextOption"
import { TokenAndLogo } from "../../../core/TokenAndLogo"
import { MarginContext, SwapContext } from "../Swap"
import { inputToOutputAmount } from "../TradePortal/BuySell"

export const YourPositions = () => {
    const TABS = { longs: "LONGS", shorts: "SHORTS" };
    const { baseToken, assetToken } = useContext(TokenPairContext);
    const [selectedTab, setSelectedTab] = useState(TABS.longs);
    const { exchangeAssetTokenBalance, exchangeBaseTokenBalance, } = useContext(SwapContext);
    const { account: { basePosition, assetPosition, isLoading }, marginMarkets } = useContext(MarginContext);
    const { address } = useContext(AccountContext);
    const { contracts: { MarginEthRouter }} = useContext(EthersContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [isSubmitLoading, setIsSubmitLoading] = useState();

    const position = selectedTab === TABS.longs ? basePosition : assetPosition;
    const [borrowToken, tradeToken] = selectedTab === TABS.longs ? [baseToken, assetToken] : [assetToken, baseToken];

    const closePosition = async () => {
        setIsSubmitLoading(true);
        try {
            if (borrowToken.name === "Ethereum") {
                const MarginMarket = marginMarkets[borrowToken.address];
                // TODO: Cache this authorization result in a hook somewhere
                const isAuthorized = await MarginMarket.isAuthorized(address, MarginEthRouter.address);
                if (!isAuthorized) {
                    await MarginMarket.authorize(MarginEthRouter.address);
                }
    
                await addTransactionNotification({
                    content: `Close ${assetToken.symbol}-${baseToken.symbol} ${selectedTab === TABS.longs ? "long" : "short"} position`,
                    transactionPromise: MarginEthRouter.closePosition(
                        tradeToken.address, 0, 0, 0, false,
                        { gasLimit: 300_000 }
                    ),
                });
            } else {
                const MarginMarket = marginMarkets[borrowToken.address];
                await addTransactionNotification({
                    content: `Close ${assetToken.symbol}-${baseToken.symbol} ${selectedTab === TABS.longs ? "long" : "short"} position`,
                    transactionPromise: MarginMarket.closePosition(0, 0, 0, false, address),
                });
            }
        } finally {
            setIsSubmitLoading(false);
        }
    }

    console.log("position", position);

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.small, width: "fit-content" }}>
                <TextOption 
                    selected={selectedTab === TABS.longs}
                    onClick={() => setSelectedTab(TABS.longs)}
                >
                    Your Longs
                </TextOption>

                <TextOption 
                    selected={selectedTab === TABS.shorts}
                    onClick={() => setSelectedTab(TABS.shorts)}
                >
                    Your Shorts
                </TextOption>
            </div>


            <Card style={{ width: "100%" }}>
                <div style={{ width: "100%", display: "grid", rowGap: PIXEL_SIZING.small }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                        <TokenAndLogo token={borrowToken}>
                            Position Value
                        </TokenAndLogo>

                        {
                            isLoading ?
                                <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                : <Text secondary bold>
                                    {
                                        inputToOutputAmount(
                                            position.collateralAmount, 
                                            selectedTab === TABS.longs ? exchangeAssetTokenBalance : exchangeBaseTokenBalance, 
                                            selectedTab === TABS.longs ? exchangeBaseTokenBalance : exchangeAssetTokenBalance, 
                                            FEE_RATE
                                        ).toFixed(4)
                                    }
                                    
                                    {" " + borrowToken.symbol}
                                </Text>
                        }
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                        <TokenAndLogo token={borrowToken}>
                            Total Borrowed
                        </TokenAndLogo>

                        {
                            isLoading ?
                                <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                : <Text secondary bold>{position.borrowedAmount.toFixed(4)} {borrowToken.symbol}</Text>
                        }
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                        <TokenAndLogo token={borrowToken}>
                            Maintenance Margin
                        </TokenAndLogo>

                        {
                            isLoading ?
                                <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                : <Text secondary bold>{position.maintenanceMargin.toFixed(4)} {borrowToken.symbol}</Text>
                        }
                    </div>

                    <Button 
                        primary 
                        style={{ width: "100%" }}
                        onClick={closePosition}
                        isLoading={isSubmitLoading}
                    >
                        Close {selectedTab === TABS.longs ? "Long" : "Short"} Position
                    </Button>
                </div>
            </Card>
        </div>
    )
}