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
    const { assetToken, baseToken, imebToken } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const { 
        exchangeContract, 
        exchangeAssetTokenBalance, 
        exchangeBaseTokenBalance, 
        liquidityToken,
    } = useContext(SwapContext);
    const [accountLiquidityTokenBalance, setAccountLiquidityTokenBalance] = useState();
    const [liquidityTokenTotalSupply, setLiquidityTokenTotalSupply] = useState();
    const [accountUnclaimedImebEarnings, setAccountUnclaimedImebEarnings] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isClaimEarningsLoading, setIsClaimEarningsLoading] = useState(false);
    const { addTransactionNotification } = useContext(NotificationsContext);

    useEffect(() => {
        if (liquidityToken) {
            setIsLoading(true);
            Promise.all([
                liquidityToken.balanceOf(address, { gasLimit: 100000 }).then(rawBalance => {
                    setAccountLiquidityTokenBalance(ethers.utils.formatUnits(rawBalance, 18));
                }),
                liquidityToken.totalSupply({ gasLimit: 100000 }).then(rawTotalSupply => {
                    setLiquidityTokenTotalSupply(ethers.utils.formatUnits(rawTotalSupply, 18));
                }),
                liquidityToken.dividendsOf(address, { gasLimit: 100000 }).then(rawDividends => {
                    setAccountUnclaimedImebEarnings(ethers.utils.formatUnits(rawDividends, 18));
                }),
            ]).then(() => {
                setIsLoading(false);
            });
        }
    }, [liquidityToken]);

    const [accountAssetDeposit, accountBaseDeposit] = [
        parseFloat(exchangeAssetTokenBalance) * parseFloat(accountLiquidityTokenBalance) / parseFloat(liquidityTokenTotalSupply),
        parseFloat(exchangeBaseTokenBalance) * parseFloat(accountLiquidityTokenBalance) / parseFloat(liquidityTokenTotalSupply)
    ];

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
                                    : <Text secondary bold>{accountAssetDeposit.toFixed(4)} {assetToken.symbol}</Text>
                            }
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                            <TokenAndLogo token={baseToken}/>
                            {
                                isLoading ?
                                    <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                    : <Text secondary bold>{accountBaseDeposit.toFixed(4)} {baseToken.symbol}</Text>
                            }
                        </div>
                    </div>
                    
                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.small, }}>
                        <Text bold>Intermex Bill Earnings (Unclaimed)</Text>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                            <TokenAndLogo token={imebToken}/>
                            {
                                isLoading ?
                                    <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                    : <Text secondary bold>{parseFloat(accountUnclaimedImebEarnings)?.toFixed(4)} {imebToken.symbol}</Text>
                            }
                        </div>

                        <TextButton 
                            style={{ justifySelf: "right" }}
                            requiresWallet
                            onClick={async () => {
                                setIsClaimEarningsLoading(true);
                                const transactionPromise = liquidityToken.claimDividends({ gasLimit: 1000000 });
                                addTransactionNotification({
                                    content: `Claim Intermex Bill token dividends from ${assetToken.name}-${baseToken.name} swap liquidity pool`,
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