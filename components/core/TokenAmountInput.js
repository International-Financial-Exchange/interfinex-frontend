import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { TokenAndLogo } from "./TokenAndLogo";
import { TextButton } from "./Button";
import { Input } from "./Input";
import Text from "./Text";
import { PIXEL_SIZING } from "../../utils/constants";
import Big from "big.js";
import { usePrevious } from "../../utils/hooks";

export const TokenAmountInput = ({ token, style, errorMessage, ...props }) => {
    const theme = useContext(ThemeContext);
    const [_value, setValue] = useState();
    const previousPropsValue = usePrevious(props.value);

    console.log("props", props.value?.toFixed());
    const value = !props?.value.eq(previousPropsValue || new Big(0)) ? props.value.toFixed() : _value;

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
                    value={value}
                    onChange={e => {
                        const num = new Big(e.target.value || 0);
                        setValue(e.target.value);
                        props.onChange(num, e);
                    }}
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