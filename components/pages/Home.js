import Head from 'next/head'
import Layout from '../layout/Layout'
import { ThemeContext } from 'styled-components'
import { useContext } from 'react';
import Text from "../core/Text";
import Button from '../core/Button';
import { PIXEL_SIZING } from '../../utils';
import Link from 'next/link';

export default function Home() {
    return (
        <Layout>
            <div>
                <div 
                    style={{ 
                        display: "grid", 
                        justifyItems: "center", 
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <Text primary style={{ fontSize: PIXEL_SIZING.huge, marginBottom: PIXEL_SIZING.small, textAlign: "center" }}>
                        Welcome to Intermex
                    </Text>

                    <Text secondary style={{ fontSize: PIXEL_SIZING.large, textAlign: "center" }}>
                        The International Mercantile Exchange
                    </Text>

                    <Link href={"/app/dashboard"}>
                        <Button style={{ width: "100%", marginTop: PIXEL_SIZING.huge, height: PIXEL_SIZING.huge, fontSize: PIXEL_SIZING.large }}>
                            Start Investing
                        </Button>
                    </Link>
                </div>
            </div>
        </Layout>
    )
}
