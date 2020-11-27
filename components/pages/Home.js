import Head from 'next/head'
import { Layout } from '../layout/Layout'
import { ThemeContext } from 'styled-components'
import { useContext } from 'react';
import Text from "../core/Text";
import { ArrowButton, Button } from '../core/Button';
import { CONTAINER_SIZING, PIXEL_SIZING } from '../../utils';
import Link from 'next/link';

export default function Home() {
    return (
        <Layout showNotifications={false}>
            <div 
                style={{ 
                    display: "grid", 
                    justifyItems: "center", 
                    position: "absolute",
                    width: "fit-content",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}
            >
                <Text primary style={{ fontSize: PIXEL_SIZING.larger, marginBottom: PIXEL_SIZING.small, textAlign: "center" }}>
                    Welcome to Interfinex
                </Text>

                <Text secondary style={{ fontSize: PIXEL_SIZING.medium, textAlign: "center", }}>
                    Trade and loan any ERC20 token with up to 500x leverage
                </Text>

                <div style={{ display: "grid", width: "80%", rowGap: PIXEL_SIZING.small }}>
                    <Link href={"/app/swap"}>
                        <Button style={{ width: "100%", marginTop: PIXEL_SIZING.large, height: PIXEL_SIZING.larger, fontSize: PIXEL_SIZING.medium }}>
                            Start Trading
                        </Button>
                    </Link>

                    <Button 
                        secondary
                        style={{ width: "100%", marginTop: PIXEL_SIZING.tiny, height: PIXEL_SIZING.larger, fontSize: PIXEL_SIZING.medium }}
                        onClick={() => window.open("https://t.me/interfinexio")}
                    >
                        Join us on Telegram
                    </Button>
                </div>
            </div>
        </Layout>
    )
}
