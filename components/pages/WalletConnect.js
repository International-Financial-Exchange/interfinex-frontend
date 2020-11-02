import ReactDOM from "react-dom";
import Text from "../core/Text";
import { PIXEL_SIZING, useDocument, CONTAINER_SIZING } from "../../utils";
import { Card } from "../core/Card";
import styled from "styled-components";
import { useContext } from "react";
import { EthersContext } from "../../context/Ethers";
import { useRouter } from "next/router";
import { Cross } from "../core/Cross";
import { ethers } from "ethers";
import { AccountContext } from "../../context/Account";

const WalletOptionCard = styled(Card)`
    transition: all 0.1s ease-out;

    &:active {
        transform: scale(1.0) !important;
    }

    &:hover {
        transform: scale(1.05);
        cursor: pointer;
    }
`

const WalletOption = ({ label, icon, onClick }) => {
    return (
        <WalletOptionCard 
            style={{ padding: PIXEL_SIZING.large, display: "grid", justifyItems: "center" }}
            onClick={onClick}
        >
            <img
                src={icon}
                style={{ height: CONTAINER_SIZING.tiny }}
            />

            <Text primary style={{ marginTop: PIXEL_SIZING.medium }}>{ label }</Text>
        </WalletOptionCard>
    );
};

export const WalletConnect = () => {
    const document = useDocument(); 
    const router = useRouter();
    const { setProvider, setSigner } = useContext(EthersContext);

    return (
        !document ?
            null
            : ReactDOM.createPortal(
                <div style={{ position: "fixed", height: "100%", width: "100%", zIndex: 1, backgroundColor: "white" }}>
                    <Cross
                        style={{ position: "absolute", right: "5%", top: "5%" }}
                        onClick={() => router.back()}
                    />

                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                        <Text primary style={{ textAlign: "center", width: 300 }}>
                            Connect your wallet
                        </Text>
                        
                        <div style={{ marginTop: PIXEL_SIZING.huge, display: "grid", gridTemplateColumns: "1fr", justifyItems: "center" }}>
                            <WalletOption
                                label={"Metamask"}
                                icon={"/metamask-logo.png"}
                                onClick={() => {
                                    window.ethereum.enable().then(async () => {                
                                        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
                                        console.log(newProvider)
                                        console.log(newProvider.getSigner());
                                        setProvider(newProvider);
                                        setSigner(newProvider.getSigner());
                                        router.back();
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>,
                document?.getElementById("root")
            )
    );
};