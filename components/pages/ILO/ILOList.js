import { PIXEL_SIZING } from "../../../utils/constants";
import { Layout } from "../../layout/Layout";
import styled from "styled-components";
import Text from "../../core/Text";
import { AddButton } from "../../core/Button";
import Link from "next/link";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    row-gap: ${PIXEL_SIZING.large};
`;

const TitleContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
    align-items: center;
    margin-top: ${PIXEL_SIZING.medium};

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        row-gap: ${PIXEL_SIZING.medium};

        #create-ilo-button {
            justify-items: left;
            grid-template-columns: auto 1fr;
            width: fit-content;
        }
    }
`;

export const ILOList = () => {
    return (
        <Layout>
            <Container>
                <TitleContainer>
                    <Text primary bold>Initial Liquidity Offerings</Text>
                    <AddButton id="create-ilo-button">
                        <Link href="/app/ilo/create">
                            Create New ILO
                        </Link>
                    </AddButton>
                </TitleContainer>
            </Container>
        </Layout>
    );
}