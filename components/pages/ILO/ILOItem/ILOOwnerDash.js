import { useContext, useState } from "react";
import Skeleton from "react-loading-skeleton";
import styled, { ThemeContext } from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext } from "../../../../context/Notifications";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Button } from "../../../core/Button";
import { Card } from "../../../core/Card";
import { InfoBubble } from "../../../core/InfoBubble";
import Text from "../../../core/Text";
import { TextOption } from "../../../core/TextOption";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { useYourIloInvestment } from "../hooks";
import { IloContext } from "./ILOItem";

const Container = styled(Card)`
    width: 100%;
    height: fit-content;
    padding: ${PIXEL_SIZING.medium};
    display: grid;
    row-gap: ${PIXEL_SIZING.medium};
`;

export const ILOOwnerDash = () => {
    const { ilo, isLoading, ILOContract } = useContext(IloContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const { address } = useContext(AccountContext);
    const [isWithdrawEthLoading, setIsWithdrawEthLoading] = useState(false);
    const [isWithdrawLiquidityLoading, setIsWithdrawLiquidityLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const {
        assetToken,
        hasEnded,
        ethInvested,
        percentageToLock,
        liquidityUnlockDate,
        hasCreatorWithdrawn,
    } = ilo || {};

    const withdrawEth = async () => {
        setIsWithdrawEthLoading(true);
        try {
            await addTransactionNotification({
                content: `Owner withdraw ETH from ILO`,
                transactionPromise: ILOContract.ownerWithdrawFunds(address)
            });
        } finally {
            setIsWithdrawEthLoading(false);
        }
    };

    const withdrawLiquidity = async () => {
        setIsWithdrawLiquidityLoading(true);
        try {
            await addTransactionNotification({
                content: `Owner withdraw ETH:${assetToken.symbol} swap pool liquidity from ILO`,
                transactionPromise: ILOContract.ownerWithdrawLiquidity(address)
            });
        } finally {
            setIsWithdrawLiquidityLoading(false);
        }
    };

    const raisedEthAvailable = hasCreatorWithdrawn ? 0 : ethInvested;

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
            <TextOption selected style={{ width: "fit-content" }}>
                Owner Contol Panel
            </TextOption>

            <Container>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                    <TokenAndLogo token={ETHEREUM_TOKEN}>
                        Raised ETH Available
                    </TokenAndLogo>

                    {
                        isLoading ?
                            <Skeleton width={CONTAINER_SIZING.miniscule}/>
                            : <Text secondary bold>{raisedEthAvailable.toFixed(4)} {ETHEREUM_TOKEN.symbol}</Text>
                    }
                </div>

                <Button 
                    primary 
                    style={{ width: "100%" }}
                    requiresWallet
                    onClick={withdrawEth}
                    isLoading={isWithdrawEthLoading}
                    isDisabled={!hasEnded}
                >
                    Withdraw ETH
                </Button>

                {
                    liquidityUnlockDate > 0 &&
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                                <Text>Liquidity Percentage Locked</Text>
            
                                {
                                    isLoading ?
                                        <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                        : <Text style={{ color: theme.colors.positive }} secondary bold>{percentageToLock.toFixed(4)}%</Text>
                                }
                            </div>
        
                            <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                                <Text>Liquidity Unlock Date</Text>

                                {
                                    isLoading ?
                                        <Skeleton width={CONTAINER_SIZING.miniscule}/>
                                        : <Text secondary bold>{new Date(liquidityUnlockDate * 1000).toLocaleDateString()}</Text>
                                }
                            </div>

                            <Button 
                                primary 
                                secondary
                                style={{ width: "100%" }}
                                requiresWallet
                                onClick={withdrawLiquidity}
                                isLoading={isWithdrawLiquidityLoading}
                                isDisabled={Math.floor(Date.now() / 1000) < liquidityUnlockDate}
                            >
                                Withdraw Liquidity
                            </Button>
                        </>
                }
            </Container>
        </div>
    );
};