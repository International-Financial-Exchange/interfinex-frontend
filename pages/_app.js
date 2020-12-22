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

import Router from 'next/router';
import NProgress from 'nprogress'; 
import 'nprogress/nprogress.css'; 

Router.events.on('routeChangeStart', () => NProgress.start()); 
Router.events.on('routeChangeComplete', () => NProgress.done()); 
Router.events.on('routeChangeError', () => NProgress.done());

export default ({ Component, pageProps }) => {
    return (
        <Theme>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <NotificationsProvider>
                    <EthersProvider>
                        <TokenPairProvider>
                            <AccountProvider>
                                <Head>
                                    <title>Interfinex</title>
                                    <link rel="icon" href="/logo.png" />
                                    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
                                    <meta name="description" content="Access financial products and DeFi for any ethereum token - The international financial exchange."/>
                                </Head>

                                <div style={{ display: "grid", gridTemplateRows: "auto 1fr", width: "100%", minHeight: "100%", marginBottom: PIXEL_SIZING.large }} id={"root"}>
                                    <NavBar/>
                                    <Component {...pageProps}/>
                                </div>
                                
                                <Footer/>
                            </AccountProvider>
                        </TokenPairProvider>
                    </EthersProvider>
                </NotificationsProvider>
            </MuiPickersUtilsProvider>
        </Theme>
    );
};
