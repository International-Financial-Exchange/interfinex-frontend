import { parseEther } from "ethers/lib/utils";
import { useContext, useState } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
import { AccountContext } from "../../../../../context/Account";
import { EthersContext } from "../../../../../context/Ethers";
import { NotificationsContext } from "../../../../../context/Notifications";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { CONTAINER_SIZING, parseTokenAmount, PIXEL_SIZING, safeParseEther } from "../../../../../utils";
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
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { selectedToken, liquidityToken: _liquidityToken, account: _account, stats, isLoading } = useContext(FundingContext);
    const { approveMarginMarket: _approveMarginMarket, marginMarkets, approveMarginRouter } = useContext(MarginContext);
    const [tokenAmount, setTokenAmount] = useState();
    const [isDepositLoading, setIsDepositLoading] = useState();
    const [isWithdrawLoading, setIsWithdrawLoading] = useState();
    const { assetTokenBalance, baseTokenBalance, address } = useContext(AccountContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const { contracts: { MarginEthRouter }} = useContext(EthersContext);

    const isAssetToken = selectedToken.address === assetToken.address;

    const MarginMarket = marginMarkets[selectedToken.address];
    const liquidityToken = _liquidityToken?.[selectedToken.address];
    const approveMarginMarket = _approveMarginMarket?.[selectedToken.address];
    const account = _account?.[selectedToken.address];
    const totalValue = stats?.[MarginMarket.address]?.totalValue;

    const depositLiquidity = async () => {
        setIsDepositLoading(true);
        try {
            if (selectedToken.name === "Ethereum") {
                await addTransactionNotification({
                    content: `Deposit ${tokenAmount} ${selectedToken.symbol} to the funding pool`,
                    transactionPromise: MarginEthRouter.deposit(
                        isAssetToken ? baseToken.address : assetToken.address,
                        { value: safeParseEther(tokenAmount.toString()), gasLimit: 375_000 }
                    )
                });
            } else {
                await approveMarginMarket(selectedToken);
    
                await addTransactionNotification({
                    content: `Deposit ${tokenAmount} ${selectedToken.symbol} to the funding pool`,
                    transactionPromise: MarginMarket.deposit(
                        parseTokenAmount(tokenAmount, selectedToken),
                    )
                });
            }
        } finally {
            setIsDepositLoading(false);
        }
    }

    const withdrawLiquidity = async () => {
        setIsWithdrawLoading(true);
        try {
            if (selectedToken.name === "Ethereum") {
                await approveMarginRouter(liquidityToken);
    
                const liquidityTokenAmount = (liquidityToken.totalSupply * tokenAmount) / totalValue;
                await addTransactionNotification({
                    content: `Withdraw ${parseFloat(tokenAmount).toFixed(4)} ${selectedToken.symbol} from funding pool`,
                    transactionPromise: MarginEthRouter.withdraw(
                        isAssetToken ? baseToken.address : assetToken.address,
                        parseTokenAmount(liquidityTokenAmount, { decimals: 18 }),
                    )
                });
            } else {
                await approveMarginMarket(liquidityToken);
    
                const liquidityTokenAmount = (liquidityToken.totalSupply * tokenAmount) / totalValue;
                await addTransactionNotification({
                    content: `Withdraw ${parseFloat(tokenAmount).toFixed(4)} ${selectedToken.symbol} from funding pool`,
                    transactionPromise: MarginMarket.withdraw(
                        parseTokenAmount(liquidityTokenAmount, { decimals: 18 }),
                    )
                });
            }
        } finally {
            setIsWithdrawLoading(false);
        }
    }

    return (
        <Container>
            {
                _account?.isLoading ?
                    <>
                        <Skeleton style={{ height: PIXEL_SIZING.large }}/>
                        <Skeleton style={{ height: PIXEL_SIZING.huge }}/>
                    </>
                :
                    <>
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
                                    setTokenAmount(account.assetTokenDeposited)
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
                            onClick={depositLiquidity}
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
                            onClick={withdrawLiquidity}
                        >
                            <Text primary style={{ color: "white", fontSize: 15 }}>
                                Withdraw Liquidity
                            </Text>
                        </Button>
                    </>
            }
        </Container>
    );
};