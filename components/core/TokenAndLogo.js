import Text from "./Text";
import { PIXEL_SIZING } from "../../utils";

export const TokenAndLogo = ({ token, style, isSymbol, children, primary, ...props }) => {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.tiny, alignItems: "center", ...style }} {...props}>
            <img
                loading="lazy"
                style={{ height: primary ? PIXEL_SIZING.large : PIXEL_SIZING.medium }}
                src={token.logoURI}
            />

            {
                children ?
                    children
                    : <Text primary={primary} bold={primary} style={{ textOverflow: "ellipsis", width: "100%", overflow: "hidden" }}>
                        {isSymbol ? token.symbol : token.name}
                    </Text>
            }
        </div>
    );
};