import { useContext } from "react";
import { ThemeContext } from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { PIXEL_SIZING } from "../../../../utils/constants";

export const AccountEthBalance = props => {
    const { ethBalance } = useContext(AccountContext);
    const theme = useContext(ThemeContext);

    return (
        <div 
            style={{ 
                border: `1px solid ${theme.colors.highlight}`, 
                padding: PIXEL_SIZING.small, 
                marginRight: PIXEL_SIZING.small,
                borderRadius: PIXEL_SIZING.tiny,
                userSelect: "none",
                width: "fit-content",
            }}
            {...props}
        >
            {ethBalance.toFixed(4)} ETH
        </div>
    );
};