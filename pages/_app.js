import '../styles/globals.css'
import Layout from '../components/layout/Layout';
import Head from 'next/head';
import { Theme } from '../context/Theme';
import NavBar from '../components/layout/NavBar/NavBar';
import { EthersProvider } from '../context/Ethers';
import { TokenPairProvider } from '../context/TokenPair';
import { AccountProvider } from '../context/Account';
import { NotificationsProvider } from '../context/Notifications';
import { Footer } from '../components/layout/Footer';
import { PIXEL_SIZING } from '../utils/constants';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { SkeletonTheme } from "react-loading-skeleton";

import Router from 'next/router';
import NProgress from 'nprogress'; 
import 'nprogress/nprogress.css'; 
import styled, { ThemeContext } from 'styled-components';
import { useContext } from 'react';
import { shade } from '../utils/utils';

Router.events.on('routeChangeStart', () => NProgress.start()); 
Router.events.on('routeChangeComplete', () => NProgress.done()); 
Router.events.on('routeChangeError', () => NProgress.done());

const AppBodyContainer = styled.div`
    width: 100%; 
    min-height: 100%; 
    background-color: ${({ theme }) => theme.colors.invert};

    > div > div {
        display: grid;
        color: ${({ theme }) => theme.colors.textPrimary};
        padding-bottom: ${PIXEL_SIZING.large}; 
        grid-template-rows: auto 1fr; 
        width: 100%; 
        min-height: 100%; 
    }
`;

const AppBody = ({ children, ...props }) => {
    const theme = useContext(ThemeContext);

    return (
        <AppBodyContainer {...props}>
            <SkeletonTheme color={shade(theme.colors.invert, 0.2)} highlightColor={shade(theme.colors.invert, 0.45)}>
                <div id={"root"}>
                    {children}
                </div>
            </SkeletonTheme>
        </AppBodyContainer>
    );
}

export default ({ Component, pageProps }) => {
    return (
        <Theme>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <EthersProvider>
                    <NotificationsProvider>
                        <TokenPairProvider>
                            <AccountProvider>
                                <Head>
                                    <title>Interfinex</title>
                                    <link rel="icon" href="/logo.png" />
                                    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
                                    <script src='https://cdn.jsdelivr.net/npm/big.js@6.0.0/big.min.js'></script>
                                    <meta name="description" content="Access financial products and DeFi for any ethereum token - The international financial exchange."/>
                                </Head>

                                <AppBody>
                                    <NavBar/>
                                    <Component {...pageProps}/>
                                </AppBody>
                                
                                <Footer/>
                            </AccountProvider>
                        </TokenPairProvider>
                    </NotificationsProvider>
                </EthersProvider>
            </MuiPickersUtilsProvider>
        </Theme>
    );
};
