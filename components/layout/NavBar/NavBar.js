import { PIXEL_SIZING } from "../../../utils";

import styled from "styled-components";
import Link from "next/link";
import { useRouter } from 'next/router'

import Button from "../../core/Button";
import Span from "../../core/Span";
import Text from "../../core/Text";
import AppNavBar from "./AppNavBar";
import HomeNavBar from "./HomeNavBar";


const Container = styled.div`
    padding: ${PIXEL_SIZING.medium};
    background-color: ${({ theme }) => theme.colors.invert};
    box-shadow: ${({ theme }) => theme.colors.boxShadow};
`


export default () => {
    const router = useRouter();
    const isAppPage = router.asPath.startsWith("/app");
    console.log(router);

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