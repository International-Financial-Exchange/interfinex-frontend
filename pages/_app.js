import '../styles/globals.css'
import Layout from '../components/layout/Layout';
import Head from 'next/head';
import { Theme } from '../context/Theme';
import NavBar from '../components/layout/NavBar/NavBar';
import { EthersProvider } from '../context/Ethers';
import { TokenPairProvider } from '../context/TokenPair';

export default ({ Component, pageProps }) => {
    return (
        <Theme>
            <EthersProvider>
                <TokenPairProvider>
                    <Head>
                        <title>Intermex</title>
                        <link rel="icon" href="/favicon.ico" />
                    </Head>

                    <div style={{ display: "grid", width: "100%", height: "100%" }} id={"root"}>
                        <NavBar/>
                        <Component {...pageProps}/>
                    </div>
                </TokenPairProvider>
            </EthersProvider>
        </Theme>
    );
};
