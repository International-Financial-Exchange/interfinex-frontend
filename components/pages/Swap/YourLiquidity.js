import { Card } from "../../core/Card";
import Text from "../../core/Text";
import { TextOption } from "../../core/TextOption";
import { PIXEL_SIZING, CONTAINER_SIZING } from "../../../utils";
import { TokenAndLogo } from "../../core/TokenAndLogo";
import { useContext, useEffect, useState } from "react";
import { TokenPairContext } from "../../../context/TokenPair";
import { TextButton, Button } from "../../core/Button";
import { SwapContext } from "./Swap";
import { AccountContext } from "../../../context/Account";
import ethers from "ethers";
import Skeleton from "react-loading-skeleton";
import { NotificationsContext } from "../../../context/Notifications";

export const YourLiquidity = () => {
    const { assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const { account, isExchangeInfoLoading, liquidityToken, } = useContext(SwapContext);
    const [accountLiquidityTokenBalance, setAccountLiquidityTokenBalance] = useState();
    const [liquidityTokenTotalSupply, setLiquidityTokenTotalSupply] = useState();
    const [accountUnclaimedIfexEarnings, setAccountUnclaimedIfexEarnings] = useState();
    const [isClaimEarningsLoading, setIsClaimEarningsLoading] = useState(false);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [isDividendsLoading, setIsDividendsLoading] = useState();

    useEffect(() => {
        if (liquidityToken && address) {
            setIsDividendsLoading(true);
            liquidityToken.dividendsOf(address, { gasLimit: 100000 }).then(async rawDividends => {
                setAccountUnclaimedIfexEarnings(ethers.utils.formatUnits(rawDividends, 18));
            }).then(() => {
                setIsDividendsLoading(false);
            });
        }
    }, [liquidityToken?.address, address]);

    const isLoading = !account || isExchangeInfoLoading || isDividendsLoading;

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
            <TextOption selected>
                Your Liquidity
            </TextOption>

            <Card style={{ height: "fit-content", width: "100%", padding: PIXEL_SIZING.medium }}>
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.medium }}>
                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, }}>
                        <Text bold>Deposited Liquidity</Text>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                            <TokenAndLogo token={assetToken}/>
                            {
                                isLoading ?
                                    <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                    : <Text secondary bold>{account.depositedAssetTokenAmount.toFixed(4)} {assetToken.symbol}</Text>
                            }
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                            <TokenAndLogo token={baseToken}/>
                            {
                                isLoading ?
                                    <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                    : <Text secondary bold>{account.depositedBaseTokenAmount.toFixed(4)} {baseToken.symbol}</Text>
                            }
                        </div>
                    </div>
                    
                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, }}>
                        <Text bold>Interfinex Bill Earnings (Unclaimed)</Text>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                            <TokenAndLogo token={ifexToken}/>
                            {
                                isLoading ?
                                    <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                    : <Text secondary bold>{parseFloat(accountUnclaimedIfexEarnings)?.toFixed(4)} {ifexToken.symbol}</Text>
                            }
                        </div>

                        <TextButton 
                            style={{ justifySelf: "right" }}
                            requiresWallet
                            onClick={async () => {
                                setIsClaimEarningsLoading(true);
                                const transactionPromise = liquidityToken.claimDividends({ gasLimit: 1000000 });
                                addTransactionNotification({
                                    content: `Claim Interfinex Bill token dividends from ${assetToken.name}-${baseToken.name} swap liquidity pool`,
                                    transactionPromise,
                                });
                                transactionPromise.finally(() =>
                                    setIsClaimEarningsLoading(false)
                                );
                            }}
                            isLoading={isClaimEarningsLoading}
                        >
                            Claim Earnings
                        </TextButton>
                    </div>
                </div>
            </Card>
        </div>
    );
}