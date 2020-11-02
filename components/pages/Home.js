import Head from 'next/head'
import { Layout } from '../layout/Layout'
import { ThemeContext } from 'styled-components'
import { useContext } from 'react';
import Text from "../core/Text";
import { Button } from '../core/Button';
import { PIXEL_SIZING } from '../../utils';
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

                <Text secondary style={{ fontSize: PIXEL_SIZING.medium, textAlign: "center" }}>
                    The International Financial Exchange
                </Text>

                <Link href={"/app/swap"}>
                    <Button style={{ width: "80%", marginTop: PIXEL_SIZING.large, height: PIXEL_SIZING.larger, fontSize: PIXEL_SIZING.medium }}>
                        Start Investing
                    </Button>
                </Link>
            </div>
        </Layout>
    )
}
