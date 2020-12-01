import { Card } from "../../core/Card";
import Text from "../../core/Text";
import { TextOption } from "../../core/TextOption";
import { TokenAndLogo } from "../../core/TokenAndLogo";
import { useContext, useEffect, useState } from "react";
import { TokenPairContext } from "../../../context/TokenPair";
import { TextButton, Button } from "../../core/Button";
import { SwapContext } from "./Swap";
import { AccountContext } from "../../../context/Account";
import ethers from "ethers";
import Skeleton from "react-loading-skeleton";
import { NotificationsContext } from "../../../context/Notifications";
import { parseEther } from "ethers/lib/utils";
import { EthersContext } from "../../../context/Ethers";
import { InfoBubble } from "../../core/InfoBubble";
import { ThemeContext } from "styled-components";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants";
import { humanizeTokenAmount, parseTokenAmount } from "../../../utils/utils";
import { useYieldFarmInfo } from "../YieldFarm/hooks";

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
    const [farmInfo, isFarmInfoLoading] = useYieldFarmInfo(liquidityToken, SwapContext);
    const { blockNumber } = useContext(EthersContext);
    const theme = useContext(ThemeContext);
    const [showMoreYieldInfo, setShowMoreYieldInfo] = useState(false);

    useEffect(() => {
        if (liquidityToken && address) {
            setIsDividendsLoading(true);
            liquidityToken.contract.dividendsOf(address, { gasLimit: 100000 }).then(async rawDividends => {
                setAccountUnclaimedIfexEarnings(ethers.utils.formatUnits(rawDividends, 18));
            }).then(() => {
                setIsDividendsLoading(false);
            });
        }
    }, [liquidityToken?.address, address]);

    const isLoading = !account || isExchangeInfoLoading || isDividendsLoading || isFarmInfoLoading;

    const { contracts: { YieldFarm }} = useContext(EthersContext);
    const addFarm = async () => {
        await ifexToken.contract.transfer(YieldFarm.address, parseTokenAmount(1_000_000, { decimals: 18 }));
        await YieldFarm.addFarm(liquidityToken.address, parseTokenAmount(1000, { decimals: 18 }), 0);
    };

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
                                    : <Text secondary bold>
                                        {
                                            farmInfo ?
                                                ((parseFloat(accountUnclaimedIfexEarnings) + account.percentageOfPoolDeposited * (farmInfo.yieldPerBlock * (blockNumber - farmInfo.lastBlockUpdate)))).toFixed(4)
                                                : parseFloat(accountUnclaimedIfexEarnings)
                                        } 
                                        {" " + ifexToken.symbol}
                                    </Text>
                            }
                        </div>

                        <TextButton 
                            style={{ justifySelf: "right" }}
                            requiresWallet
                            onClick={async () => {
                                setIsClaimEarningsLoading(true);
                                
                                if (farmInfo) {
                                    await YieldFarm.harvest(liquidityToken.address);
                                }

                                const transactionPromise = liquidityToken.contract.claimDividends({ gasLimit: 1000000 });
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
            
            {
                farmInfo &&
                    <InfoBubble 
                        style={{ 
                            display: "grid", 
                            rowGap: PIXEL_SIZING.small,
                        }}
                    >
                        <div style={{ fontWeight: "bold" }}>
                            {
                                account?.percentageOfPoolDeposited > 0 ?
                                    "👨‍🌾 You are Farming this liquidity pool"
                                    : "👨‍🌾 You can Farm this liquidity pool"
                            }
                        </div>
                        
                        <div style={{ width: "75%", display: "grid", rowGap: PIXEL_SIZING.miniscule }}>
                            <div style={{ display: "grid", gridTemplateColumns: "50% auto", }}>
                                <div>Annual APR:</div> 
                                <div style={{ color: theme.colors.positive, fontWeight: "bold" }}>
                                    {" " + farmInfo.annualAPR}%
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "50% auto" }}>
                                <div>
                                    Annual Yield:
                                </div> 
                                <div style={{ fontWeight: "bold" }}>
                                    {" " + farmInfo.annualYield} IFEX
                                </div>
                            </div>
                        </div>

                        <TextButton 
                            onClick={() => setShowMoreYieldInfo(!showMoreYieldInfo)}
                            style={{ justifySelf: "right", color: "white" }}
                        >
                            Show {showMoreYieldInfo ? "Less" : "More"} Info
                        </TextButton>

                        {
                            showMoreYieldInfo &&
                                <div>
                                    Deposit liquidity into the pool and earn IFEX tokens every block. 
                                    The amount you earn is directly proportional to the amount you deposit into the pool.
                                    Happy farming!
                                </div>
                        }
                    </InfoBubble>
            }
        </div>
    );
}