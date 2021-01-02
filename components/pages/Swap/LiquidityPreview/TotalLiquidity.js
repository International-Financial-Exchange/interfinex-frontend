import { useContext } from "react";
import Skeleton from "react-loading-skeleton";
import { TokenPairContext } from "../../../../context/TokenPair";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Card } from "../../../core/Card";
import Text from "../../../core/Text";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { SwapContext } from "../Swap";

export const TotalLiquidity = () => {
    const { assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { account, isExchangeInfoLoading, exchangeAssetTokenBalance, exchangeBaseTokenBalance } = useContext(SwapContext);

    const isLoading = isExchangeInfoLoading;

    return (
        <Card style={{ height: "fit-content", width: "100%", padding: PIXEL_SIZING.medium }}>
            <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                    <TokenAndLogo token={assetToken}/>
                    {
                        isLoading ?
                            <Skeleton width={CONTAINER_SIZING.miniscule}/>
                            : <Text secondary bold>{exchangeAssetTokenBalance.toFixed(4)} {assetToken.symbol}</Text>
                    }
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                    <TokenAndLogo token={baseToken}/>
                    {
                        isLoading ?
                            <Skeleton width={CONTAINER_SIZING.miniscule}/>
                            : <Text secondary bold>{exchangeBaseTokenBalance.toFixed(4)} {baseToken.symbol}</Text>
                    }
                </div>
            </div>
        </Card>
    );
};