import { useContext, useState } from "react";
import { TokenPairContext } from "../../context/TokenPair";
import { PIXEL_SIZING } from "../../utils/constants";
import { Modal } from "../layout/Modal";
import { TokenSelectMenu } from "../layout/NavBar/AppNavBar";
import { ContentAndArrow } from "./ContentAndArrow";
import { ModalCard } from "./ModalCard";
import Text from "./Text";
import { TokenAndLogo } from "./TokenAndLogo";

export const TokenSelectInput = ({ value, type }) => {
    const { setAssetToken } = useContext(TokenPairContext);
    const [showSelectModal, setShowSelectModal] = useState(false);

    return (
        <>
            <ContentAndArrow
                secondary
                style={{ width: "fit-content" }}
                onClick={() => setShowSelectModal(true)}
            >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.medium }}>
                    <TokenAndLogo token={value}/>
                    <Text secondary>(Click to Change)</Text> 
                </div>
            </ContentAndArrow>

            <Modal isOpen={showSelectModal} onClose={() => setShowSelectModal(false)}>
                <ModalCard>
                    <TokenSelectMenu 
                        type={type ?? "ASSET"}
                        onClose={() => setShowSelectModal(false)}
                        onChange={(selectedToken, isCustomToken) => {
                            setAssetToken(selectedToken, isCustomToken);
                        }}
                    />
                </ModalCard>
            </Modal>
        </>
    );
};