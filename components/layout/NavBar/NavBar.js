import styled from "styled-components";
import Link from "next/link";
import { useRouter } from 'next/router'

import { Button } from "../../core/Button";
import Span from "../../core/Span";
import Text from "../../core/Text";
import { AppNavBar } from "./AppNavBar";
import HomeNavBar from "./HomeNavBar";
import { PIXEL_SIZING } from "../../../utils/constants";


const Container = styled.div`
    padding: ${PIXEL_SIZING.small};
    background-color: ${({ theme }) => theme.colors.invert};
    box-shadow: ${({ theme }) => theme.colors.boxShadow};
    height: fit-content;
    position: relative;
`;


export default () => {
    const router = useRouter();
    const isAppPage = router.asPath.startsWith("/app");

    return (
        <Container>
            {
                isAppPage ?
                    <AppNavBar/>
                    : <HomeNavBar/>
            }
        </Container>
    );
};