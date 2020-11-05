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
import { PIXEL_SIZING } from '../utils';

export default ({ Component, pageProps }) => {
    return (
        <Theme>
            <NotificationsProvider>
                <EthersProvider>
                    <TokenPairProvider>
                        <AccountProvider>
                            {/* <Head>
                                <title>Interfinex</title>
                                <link rel="icon" href="/favicon.ico" />
                                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
                                <meta name="description" content="Access financial products and DeFi for any ethereum token - The international financial exchange."/>
                            </Head> */}

                            <div style={{ display: "grid", gridTemplateRows: "auto 1fr", width: "100%", minHeight: "100%", marginBottom: PIXEL_SIZING.large }} id={"root"}>
                                <NavBar/>
                                <Component {...pageProps}/>
                            </div>
                            
                            <Footer/>
                        </AccountProvider>
                    </TokenPairProvider>
                </EthersProvider>
            </NotificationsProvider>
        </Theme>
    );
};
