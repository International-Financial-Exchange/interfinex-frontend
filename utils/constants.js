import { BigNumber } from "ethers";
import { keyframes } from "styled-components";
import { parseTokenAmount } from "./utils";

export const PIXEL_SIZING = {
    microscopic: '3px',
    miniscule: '5px',
    tiny: '8px',
    small: '13px',
    medium: '21px',
    large: '34px',
    larger: '55px',
    huge: '89px',
    humungous: '144px',
};

export const CONTAINER_SIZING = {
    microscopic: '55px',
    miniscule: '89px',
    tiny: '144px',
    small: '233px',
    medium: '377px',
    large: '610px',
    larger: '987px',
    huge: '1597px',
};

export const dropinAnimation = keyframes`
    from {
        opacity: 0.7;
        transform: scale(0.7);
    }

    to {
        opacity: 1;
        transform: scale(1.0);
    }
`;

export const TIMEFRAMES = {
    ["1m"]: 1000 * 60,
    ["15m"]: 1000 * 60 * 15,
    ["1h"]: 1000 * 60 * 60,
    ["4h"]: 1000 * 60 * 60 * 4,
    ["1d"]: 1000 * 60 * 60 * 24,
};

export const FEE_RATE = 0.001;

export const MULTIPLIER = BigNumber.from(parseTokenAmount(1, 18));