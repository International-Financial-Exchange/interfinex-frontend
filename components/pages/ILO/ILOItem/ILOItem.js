import { useRouter } from "next/router";
import { createContext, useContext, useMemo } from "react";
import styled from "styled-components";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Layout } from "../../../layout/Layout";
import { useIlo } from "../hooks";
import { ILODetails } from "./ILODetails";
import { StyledCountdown } from "../../../core/StyledCountdown";
import Text from "../../../core/Text";
import { ILOInvestPortal } from "./ILOInvestPortal";
import { EthersContext } from "../../../../context/Ethers";
import { ILO_ABI_NAMES } from "../utils";
import { YourILOInvestment } from "./YourILOInvestment";
import { ILOOwnerDash } from "./ILOOwnerDash";
import { AccountContext } from "../../../../context/Account";
import { ILOHistory } from "./ILOHistory";

const TitleContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
    align-items: center;
    margin-top: ${PIXEL_SIZING.medium};
    grid-column: 1/3;

    @media (max-width: 800px) {
        grid-column: 1;
    }

    @media (max-width: 800px) {
        grid-template-columns: 1fr;
        row-gap: ${PIXEL_SIZING.medium};

        #create-ilo-button {
            justify-items: left;
            grid-template-columns: auto 1fr;
            width: fit-content;
        }
    }
`;

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    row-gap: ${PIXEL_SIZING.large};
    grid-template-columns: 1fr auto;
    column-gap: ${PIXEL_SIZING.large};

    @media (max-width: 800px) {
        grid-template-columns: 1fr !important;
    }
`;

export const IloContext = createContext();

export const ILOItem = () => {
    const { query: { iloJson, contractAddress }} = useRouter();
    const [ilo, isLoading] = useIlo({ iloJson, contractAddress });
    const { contracts: { createContract, }, signer } = useContext(EthersContext);
    const { address } = useContext(AccountContext);

    const ILOContract = useMemo(() => {
        if (ilo) {
            return createContract(ilo?.contractAddress, ILO_ABI_NAMES[ilo.type]);
        }
    }, [ilo?.contractAddress, signer]);

    const { endDate, name, hasEnded, creator } = ilo || {}; 

    return (
        <Layout>
            <IloContext.Provider value={{ ilo, isLoading, ILOContract }}>
                <Container>
                    <TitleContainer>
                        <Text primary bold>
                            {name}
                        </Text>

                        <StyledCountdown
                            date={hasEnded ? 0 : new Date(endDate * 1000)}
                            primary
                            bold
                        />
                    </TitleContainer>

                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.large, height: "fit-content", }}>
                        <ILODetails/>
                        <ILOHistory/>
                    </div>

                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.large, height: "fit-content", width: CONTAINER_SIZING.medium }}>
                        <ILOInvestPortal/>
                        <YourILOInvestment/>

                        {
                            address === creator &&
                                <ILOOwnerDash/>
                        }
                    </div>
                </Container>
            </IloContext.Provider>
        </Layout>
    );
}