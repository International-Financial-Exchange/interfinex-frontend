import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../utils";
import { TokenAndLogo } from "./TokenAndLogo";
import { TextButton } from "./Button";
import { Input } from "./Input";
import Text from "./Text";

export const TokenAmountInput = ({ token, style, errorMessage, ...props }) => {
    const theme = useContext(ThemeContext);

    return (
        <div style={style}>
            <div style={{ position: "relative", height: "fit-content" }}>
                <TokenAndLogo
                    token={token}
                    style={{ 
                        position: "absolute", 
                        right: PIXEL_SIZING.small, 
                        top: "50%", 
                        transform: "translateY(-50%)", 
                        fontWeight: "bold", 
                        color: theme.colors.primary,
                    }}
                >
                    <TextButton>
                        {token.symbol}
                    </TextButton>
                </TokenAndLogo>

                <Input
                    type={"number"}
                    style={{ paddingRight: PIXEL_SIZING.huge }}
                    placeholder={"0.0"}
                    {...props}
                />
            </div>

            {
                props.isError &&    
                    <div style={{ marginTop: PIXEL_SIZING.microscopic }}>
                        <Text style={{ color: theme.colors.negative }}>
                            { errorMessage }
                        </Text>
                    </div>
            }
        </div>
    );
}