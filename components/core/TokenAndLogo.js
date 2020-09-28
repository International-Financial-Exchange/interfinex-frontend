import Text from "./Text";
import { PIXEL_SIZING } from "../../utils";

export const TokenAndLogo = ({ token, style, isSymbol, children, ...props }) => {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.tiny, alignItems: "center", ...style }} {...props}>
            <img
                loading="lazy"
                style={{ height: PIXEL_SIZING.medium }}
                src={token.logoURI}
            />

            {
                children ?
                    children
                    : <Text style={{ textOverflow: "ellipsis", width: "100%", overflow: "hidden" }}>
                        {isSymbol ? token.symbol : token.name}
                    </Text>
            }
        </div>
    );
};