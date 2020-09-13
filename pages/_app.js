import '../styles/globals.css'
import Layout from '../components/layout/Layout';
import Head from 'next/head';
import { Theme } from '../context/Theme';
import NavBar from '../components/layout/NavBar/NavBar';
import { EthersProvider } from '../context/Ethers';

export default ({ Component, pageProps }) => {
    return (
        <Theme>
            <EthersProvider>
                <Head>
                    <title>Intermex</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <div style={{ display: "grid", width: "100%" }} id={"root"}>
                    <NavBar/>
                    <Component {...pageProps} />
                </div>
            </EthersProvider>
        </Theme>
    );
};
