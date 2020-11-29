import { useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants";
import { TextButton } from "../../core/Button";
import Text from "../../core/Text";

const CircleContainer = styled.div`
    position: fixed;
    bottom: ${PIXEL_SIZING.large};
    right: ${PIXEL_SIZING.large};
    height: ${CONTAINER_SIZING.miniscule};
    width: ${CONTAINER_SIZING.miniscule};
    border-radius: ${CONTAINER_SIZING.larger};
    background-color: ${({ theme }) => theme.colors.textPrimary};
    border: ${({ isFocused, theme }) => isFocused ? `2px solid ${theme.colors.primary}` : null};
    z-index: 110;
    overflow: hidden;
`;

const MenuContainer = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.invert};
    top: 
    left: 0;
    right: 0;
    z-index: 100;
`;

const SvgArrow = ({ style, invert, isFocused }) => {
    const theme = useContext(ThemeContext);

    return (
        <svg 
            viewBox="0 0 926.23699 573.74994"
            style={{ 
                height: 24,
                width: 24,
                x: 0,
                y: 0,
                transform: isFocused ? "translateY(9px)" : "translateY(30px)",
                transition: "transform 0.07s ease-out",
                ...style,
            }}
        >
            <g transform="translate(904.92214,-879.1482)">
                <path 
                    d="
                        m -673.67664,1221.6502 -231.2455,-231.24803 55.6165,
                        -55.627 c 30.5891,-30.59485 56.1806,-55.627 56.8701,-55.627 0.6894,
                        0 79.8637,78.60862 175.9427,174.68583 l 174.6892,174.6858 174.6892,
                        -174.6858 c 96.079,-96.07721 175.253196,-174.68583 175.942696,
                        -174.68583 0.6895,0 26.281,25.03215 56.8701,
                        55.627 l 55.6165,55.627 -231.245496,231.24803 c -127.185,127.1864
                        -231.5279,231.248 -231.873,231.248 -0.3451,0 -104.688,
                        -104.0616 -231.873,-231.248 z
                    " 
                    fill={theme.colors.primary}
                >
                </path>
            </g>
        </svg>
    );
}

export const CircleNav = ({ id, items, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <>
            <CircleContainer id={id} onClick={() => setIsFocused(!isFocused)} isFocused={isFocused}>
                <div style={{ height: "100%", width: "100%", position: "relative" }}>
                    <div className={"center-absolute"} style={{ display: "grid", alignItems: "center", justifyItems: "center" }}>
                        <SvgArrow isFocused={isFocused}/>

                        <div style={{ transform: "rotate(180deg)", }}>
                            <SvgArrow isFocused={isFocused}/>
                        </div>
                    </div>
                </div>
            </CircleContainer>

            {
                isFocused &&
                    <MenuContainer>
                        <div 
                            className={"center-absolute"}
                            style={{ 
                                display: "grid",
                                justifyItems: "center",
                                rowGap: PIXEL_SIZING.large,
                            }}
                        >
                            {
                                items.map(({ label, value }) =>
                                    <TextButton 
                                        primary 
                                        onClick={() => {
                                            onChange(value);
                                            setIsFocused(false);
                                        }}
                                    >
                                        {label}
                                    </TextButton>
                                )
                            }
                        </div>
                    </MenuContainer>
            }
        </>
    )
};