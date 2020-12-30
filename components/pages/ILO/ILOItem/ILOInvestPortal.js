import { useContext, useEffect, useState } from "react";
import { Card } from "../../../core/Card";
import { IloContext } from "./ILOItem";
import styled from "styled-components";
import { PIXEL_SIZING } from "../../../../utils/constants";
import { InputAndLabel } from "../../../core/InputAndLabel";
import { EthersContext } from "../../../../context/Ethers";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import Text from "../../../core/Text";
import { Button } from "../../../core/Button";
import { getIloCurrentTokensPerEth, getIloEthHardcap } from "../utils";
import Skeleton from "react-loading-skeleton";
import { parseTokenAmount, tokenAmountToBig } from "../../../../utils/utils";
import { AccountContext } from "../../../../context/Account";
import { NotificationsContext } from "../../../../context/Notifications";
import Big from "big.js";

const Container = styled(Card)`
    width: 100%;
    height: fit-content;
    padding: ${PIXEL_SIZING.medium};
    display: grid;
    row-gap: ${PIXEL_SIZING.medium};
`;

export const ILOInvestPortal = props => {
    const { ilo, isLoading, ILOContract } = useContext(IloContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const [ethAmount, setEthAmount] = useState(new Big(0));
    const [assetTokenAmount, setAssetTokenAmount] = useState(new Big(0));
    const { ethBalance } = useContext(AccountContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [isSubmitLoading, setIsSubmitLoading] = useState();

    const { 
        endDate, 
        startDate,
        additionalDetails, 
        assetTokenAmount: totalAssetTokenAmount, 
        ethInvested,
        assetToken,
        percentageToLock,
        liquidityUnlockDate,
    } = ilo || {};

    const tokensPerEth = tokenAmountToBig(getIloCurrentTokensPerEth(ilo || {}), assetToken || {});

    const onSubmit = async () => {
        setIsSubmitLoading(true);
        try {
            await addTransactionNotification({
                content: `Invested into ${assetToken.symbol} ILO with ${ethAmount.toFixed(6)} ETH`,
                transactionPromise: ILOContract.invest({ value: parseTokenAmount(ethAmount, ETHEREUM_TOKEN) })
            });
        } finally {
            setIsSubmitLoading(false);
        }
    };

    return (
        <Container>
            <InputAndLabel>
                <Text>Amount of ETH to Invest</Text>
                <TokenAmountInput 
                    token={ETHEREUM_TOKEN}
                    onChange={num => {
                        setEthAmount(num);
                        setAssetTokenAmount(num.mul(tokensPerEth))
                    }}
                    isError={ethAmount.gt(ethBalance)}
                    errorMessage={
                        ethAmount.gt(ethBalance) ?
                            "Insufficient balance"
                            : ""
                    }
                    value={ethAmount}
                />
            </InputAndLabel>

            <InputAndLabel>
                {
                    isLoading ?
                        <>
                            <Skeleton/>    
                            <Skeleton height={PIXEL_SIZING.large}/>
                        </>
                    :
                        <>
                            <Text>Amount of {assetToken.symbol} to Buy</Text>
                            <TokenAmountInput 
                                token={assetToken}
                                onChange={num => {
                                    setAssetTokenAmount(num);
                                    setEthAmount(num.div(tokensPerEth));
                                }}
                                value={assetTokenAmount}
                            />
                        </>
                }

            </InputAndLabel>

            <Button 
                style={{ width: "100%" }}
                primary 
                requiresWallet
                onClick={onSubmit}
                isLoading={isSubmitLoading}
            >
                Invest
            </Button>
        </Container>
    );
};