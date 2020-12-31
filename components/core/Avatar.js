import { useContext, useEffect } from "react";
import Identicon from "identicon.js";
import { PIXEL_SIZING } from "../../utils/constants";
import { AccountContext } from "../../context/Account";
import { ThemeContext } from "styled-components";

export const Avatar = ({ style }) => {
    const { address } = useContext(AccountContext);
    const theme = useContext(ThemeContext);

    if (!address) return null;

    const avatarImg = new Identicon(
        address, 
        {
            margin: 0.2,
            background: [233, 236, 239],
            size: style.height,
            format: "svg"
        },
    ).toString();

    return (
        <img 
            style={{ borderRadius: 100, ...style }}
            width={style.width} 
            height={style.height} 
            src={`data:image/svg+xml;base64,${avatarImg}`}
        />
    );
};