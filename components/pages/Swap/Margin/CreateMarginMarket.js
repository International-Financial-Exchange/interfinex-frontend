import { useContext, useState } from "react";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext } from "../../../../context/Notifications";
import { TokenPairContext } from "../../../../context/TokenPair";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils";
import { Button } from "../../../core/Button";
import { ModalCard } from "../../../core/ModalCard";
import Text from "../../../core/Text";
import { Modal } from "../../../layout/Modal";


export const CreateMarginMarket = ({ closeCreateMarginMarket }) => {
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { addTransactionNotification } = useContext(NotificationsContext);
    const { contracts: { MarginFactory }} = useContext(EthersContext);
    const [isLoading, setIsLoading] = useState();

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            await addTransactionNotification({
                content: `Create margin market for ${assetToken.name} and ${baseToken.name}`,
                transactionPromise: MarginFactory.createMarketPair(assetToken.address, baseToken.address, { gasLimit: 2_000_000 }),
            });
            closeCreateMarginMarket();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen onClose={closeCreateMarginMarket}>
            <ModalCard>
                <div style={{ padding: PIXEL_SIZING.medium, display: "grid", rowGap: PIXEL_SIZING.medium, width: CONTAINER_SIZING.medium, textAlign: "center" }}>
                    <Text primary>Create Margin Market</Text>

                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
                        <Text>Margin market does not exist for this pair.</Text>
                        <Text secondary>Create a margin market and deposit liquidity into the funding book to enable margin trading.</Text>
                    </div>

                    <Button 
                        primary
                        requiresWallet
                        isLoading={isLoading}
                        style={{ width: "100%" }}
                        onClick={onSubmit}
                    >
                        Create Margin Market
                    </Button>
                </div>
            </ModalCard>
        </Modal>
    );
};