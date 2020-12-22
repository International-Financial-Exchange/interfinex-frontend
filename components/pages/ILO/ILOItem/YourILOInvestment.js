import { useContext, useState } from "react";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
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

export const YourILOInvestment = () => {
    const { ilo, isLoading, ILOContract } = useContext(IloContext);
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const [ethInvested, tokensBought, isAccountLoading] = useYourIloInvestment({ ILOContract, assetToken: ilo?.assetToken });
    const { addTransactionNotification } = useContext(NotificationsContext);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);

    const {
        assetToken,
        hasEnded
    } = ilo || {};

    const onSubmit = async () => {
        setIsSubmitLoading(true);
        try {
            await addTransactionNotification({
                content: `Withdraw from ILO`,
                transactionPromise: ILOContract.withdraw()
            });
        } finally {
            setIsSubmitLoading(false);
        }
    };

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
            <TextOption selected style={{ width: "fit-content" }}>
                Your Investment
            </TextOption>

            <Container>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                    <Text>Tokens Bought</Text>

                    {
                        isLoading || isAccountLoading ?
                            <Skeleton width={CONTAINER_SIZING.miniscule}/>
                            : <Text secondary bold>{tokensBought.toFixed(4)} {assetToken.symbol}</Text>
                    }
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                    <TokenAndLogo token={ETHEREUM_TOKEN}>
                        ETH Invested
                    </TokenAndLogo>

                    {
                        isLoading || isAccountLoading ?
                            <Skeleton width={CONTAINER_SIZING.miniscule}/>
                            : <Text secondary bold>{ethInvested.toFixed(4)} {ETHEREUM_TOKEN.symbol}</Text>
                    }
                </div>

                {
                    ethInvested > 0 &&
                        <Button 
                            primary 
                            style={{ width: "100%" }}
                            requiresWallet
                            onClick={onSubmit}
                            isLoading={isSubmitLoading}
                            isDisabled={!hasEnded}
                        >
                            Withdraw
                        </Button>
                }
            </Container>

            { 
                ethInvested > 0 &&
                    <InfoBubble>
                        You can withdraw your funds when the ILO reaches its end date or hardcap.
                    </InfoBubble>
            }
        </div>
    );
};