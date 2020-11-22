import { useContext, useState } from "react";
import styled from "styled-components";
import { AccountContext } from "../../../../../context/Account";
import { NotificationsContext } from "../../../../../context/Notifications";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { CONTAINER_SIZING, parseTokenAmount, PIXEL_SIZING } from "../../../../../utils";
import { Button, TextButton } from "../../../../core/Button";
import { Card } from "../../../../core/Card";
import Text from "../../../../core/Text";
import { TokenAmountInput } from "../../../../core/TokenAmountInput";
import { MarginContext } from "../../Swap";
import { FundingContext } from "./FundingTab";

const Container = styled(Card)`
    border-radius: ${PIXEL_SIZING.tiny};
    display: grid;
    width: ${CONTAINER_SIZING.medium};
    row-gap: ${PIXEL_SIZING.small};
    overflow: hidden;
`;

export const FundingDepositPortal = () => {
    const { assetToken } = useContext(TokenPairContext);
    const { selectedToken, liquidityToken: _liquidityToken, account: _account, stats } = useContext(FundingContext);
    const { approveMarginMarket: _approveMarginMarket, marginMarkets } = useContext(MarginContext);
    const [tokenAmount, setTokenAmount] = useState();
    const [isDepositLoading, setIsDepositLoading] = useState();
    const [isWithdrawLoading, setIsWithdrawLoading] = useState();
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { addTransactionNotification } = useContext(NotificationsContext);

    const isAssetToken = selectedToken.address === assetToken.address;

    const MarginMarket = marginMarkets[selectedToken.address];
    console.log("2liquidity token", _liquidityToken);
    const liquidityToken = _liquidityToken[selectedToken.address];
    console.log("liquidity token", liquidityToken);
    const approveMarginMarket = _approveMarginMarket[selectedToken.address];
    const account = _account[selectedToken.address];
    const totalValue = stats[MarginMarket.address].totalValue;

    // TODO: Get the user's liquidity token balance

    return (
        <Container>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center" }}>
                <Text>Amount</Text>
                <TextButton
                    requiresWallet
                    style={{ marginRight: PIXEL_SIZING.tiny }}
                    onClick={() => setTokenAmount(isAssetToken ? assetTokenBalance : baseTokenBalance)}
                >
                    Max Deposit
                </TextButton>

                <TextButton
                    requiresWallet
                    onClick={() => {
                        setTokenAmount(totalValue * account.liquidityTokenBalance / liquidityToken.totalSupply)
                    }}
                >
                    Max Withdraw
                </TextButton>
            </div>

            <TokenAmountInput
                onChange={e => setTokenAmount(e.target.value)}
                value={tokenAmount}
                token={selectedToken}
            />

            <Button
                style={{ width: "100%", height: PIXEL_SIZING.larger }}
                requiresWallet
                isLoading={isDepositLoading}
                onClick={async () => {
                    setIsDepositLoading(true);
                    try {
                        await approveMarginMarket(selectedToken);

                        await addTransactionNotification({
                            content: `Deposit ${tokenAmount} ${selectedToken.symbol} to the funding pool`,
                            transactionPromise: MarginMarket.deposit(
                                parseTokenAmount(tokenAmount, selectedToken),
                            )
                        });
                    } finally {
                        setIsDepositLoading(false);
                    }
                }}
            >
                <Text primary style={{ color: "white", fontSize: 15 }}>
                    Deposit Liquidity
                </Text>
            </Button>

            <Button 
                secondary 
                requiresWallet
                style={{ width: "100%", height: PIXEL_SIZING.larger }}
                isLoading={isWithdrawLoading}
                onClick={async () => {
                    setIsWithdrawLoading(true);
                    try {
                        await approveMarginMarket(liquidityToken);

                        console.log("supply", liquidityToken.totalSupply)
                        const liquidityTokenAmount = (liquidityToken.totalSupply * tokenAmount) / totalValue;
                        await addTransactionNotification({
                            content: `Withdraw ${parseFloat(tokenAmount).toFixed(4)} ${selectedToken.symbol} from funding pool`,
                            transactionPromise: MarginMarket.withdraw(
                                parseTokenAmount(liquidityTokenAmount, { decimals: 18 }),
                            )
                        });
                    } finally {
                        setIsWithdrawLoading(false);
                    }
                }}
            >
                <Text primary style={{ color: "white", fontSize: 15 }}>
                    Withdraw Liquidity
                </Text>
            </Button>
        </Container>
    );
};