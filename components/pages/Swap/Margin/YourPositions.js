import { useContext, useState } from "react"
import Skeleton from "react-loading-skeleton"
import { NotificationsContext } from "../../../../context/Notifications"
import { TokenPairContext } from "../../../../context/TokenPair"
import { CONTAINER_SIZING, FEE_RATE, PIXEL_SIZING } from "../../../../utils"
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
    const { addTransactionNotification } = useContext(NotificationsContext);

    const position = selectedTab === TABS.longs ? basePosition : assetPosition;
    const [borrowToken, tradeToken] = selectedTab === TABS.longs ? [baseToken, assetToken] : [assetToken, baseToken];

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
                        onClick={async () => {
                            const MarginMarket = marginMarkets[borrowToken.address];
                            await addTransactionNotification({
                                content: `Close ${assetToken.symbol}-${baseToken.symbol} ${selectedTab === TABS.longs ? "long" : "short"} position`,
                                transactionPromise: MarginMarket.closePosition(0, 0, 0, false),
                            });
                        }}
                    >
                        Close {selectedTab === TABS.longs ? "Long" : "Short"} Position
                    </Button>
                </div>
            </Card>
        </div>
    )
}