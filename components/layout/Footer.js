import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";
import { TextButton } from "../core/Button";
import Text from "../core/Text";
import { LayoutContainer } from "./Layout";

const FooterContainer = styled(LayoutContainer)`
    height: fit-content;
    padding: ${PIXEL_SIZING.medium};
    background-color: #003049;
    display: grid;
    grid-template-columns: 1fr auto;
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

                    <div onClick={() => window.open("https://twitter.com/Interfinex_io")}>
                        <TextButton style={{ color: "white" }}>
                            Twitter
                        </TextButton>
                    </div>

                    <div onClick={() => window.open("https://medium.com/@interfinexio")}>
                        <TextButton style={{ color: "white" }}>
                            Medium
                        </TextButton>
                    </div>
                </div>
            </FooterContainer>
        </footer>
    );
}