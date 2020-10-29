import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";
import { TextButton } from "../core/Button";
import Text from "../core/Text";
import { LayoutContainer } from "./Layout";

import {
    FacebookIcon,
    RedditIcon,
    TelegramIcon,
    TwitterIcon,
  } from "react-share";

const FooterContainer = styled(LayoutContainer)`
    height: fit-content;
    padding: ${PIXEL_SIZING.medium};
    background-color: #003049;
    display: grid;
    grid-template-columns: 1fr auto;
`;

const SocialMediaLink = styled.div`
    display: grid; 
    grid-template-columns: auto 1fr; 
    column-gap: ${PIXEL_SIZING.miniscule}; 
    align-items: center;

    &:hover {
        cursor: pointer;
        color: ${({ theme }) => theme.colors.secondary} !important;
    }
`;

export const Footer = () => {
    return (
        <footer style={{ width: "100%", display: "grid", backgroundColor: "#003049" }}>
            <FooterContainer>
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, height: "fit-content" }}>
                    <Text style={{ color: "white" }} bold>
                        Business Enquiries
                    </Text>
                    <Text style={{ color: "white" }}>
                        thrasymachus01@gmail.com
                    </Text>
                </div>

                <div style={{ justifySelf: "right", display: "grid", rowGap: PIXEL_SIZING.tiny, height: "fit-content" }}>
                    <Text style={{ color: "white"}} bold>
                        Social Media
                    </Text>

                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.miniscule }}>
                        {
                            [
                                { label: "Twitter", link: "https://twitter.com/Interfinex_io", icon: <TwitterIcon bgStyle={{ fill: "none" }} size={30}/> },
                                { label: "Facebook", link: "https://www.facebook.com/Interfinex-108430867734360", icon: <FacebookIcon bgStyle={{ fill: "none" }} size={30}/> },
                                { label: "Telegram", link: "https://twitter.com/Interfinex_io", icon: <TelegramIcon bgStyle={{ fill: "none" }} size={30}/> },
                                { label: "Reddit", link: "https://twitter.com/Interfinex_io", icon: <RedditIcon bgStyle={{ fill: "none" }} size={30}/> },
                                { label: "Medium", link: "https://medium.com/@interfinexio", icon: <div style={{ height: 30, width: 30 }}/>},
                            ].map(({ label, link, icon }) =>
                                <SocialMediaLink onClick={() => window.open(link)}>
                                    { icon }

                                    <TextButton style={{ color: "white" }}>
                                        {label}
                                    </TextButton>
                                </SocialMediaLink>
                            )
                        }
                    </div>
                </div>
            </FooterContainer>
        </footer>
    );
}