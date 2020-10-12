import styled from "styled-components";
import { PIXEL_SIZING, dropinAnimation } from "../../utils";
import { BarSpinner, Spinner } from "./Spinner";
import { useContext, useRef, useState } from "react";
import { AccountContext } from "../../context/Account";
import Text from "./Text";

const ButtonContainer = styled.div`
    border-radius: 4px;
    position: relative;
    padding: ${PIXEL_SIZING.small} ${PIXEL_SIZING.large};
    background-color: ${({ secondary, theme, negative }) => secondary ?
        theme.colors.secondary 
        : negative ? 
            theme.colors.negative
            : theme.colors.primary 
    };
    color: ${({ theme }) => theme.colors.invert};
    width: fit-content;
    display: grid;
    align-items: center;
    justify-items: center;
    transition: transform 0.1s ease-out, opacity 0.08s ease-out;
    user-select: none;

    &:hover {
        cursor: ${({ isDisabled }) => !isDisabled ? "pointer" : "default"};
        opacity: ${({ isDisabled }) => !isDisabled ? "0.8" : ""};
    }

    &:active {
        transform: ${({ isDisabled }) => !isDisabled ? "scale(0.95)" : ""};
    }
`;

const InfoBubbleContainer = styled.div`
    position: fixed;
    color: ${({ theme }) => theme.colors.invert};
    border-radius: ${PIXEL_SIZING.microscopic};
    background-color: rgba(0, 0, 0, 0.9);
    text-align: center;
    padding: ${PIXEL_SIZING.small};
    width: fit-content;
    z-index: 10000;
    animation: ${dropinAnimation} 0.07s forwards;
`;

const InfoBubble = ({ children, parentRef, ...props }) => {
    const { x, y, height, width } = parentRef.current?.getBoundingClientRect() ?? {};

    return (
        <InfoBubbleContainer {...props} style={{ left: x, top: y + height + 8, width: props.style.width === "100%" ? width : "fit-content" }}>
            {children}
        </InfoBubbleContainer>
    );
}

export const Button = ({ children, isLoading = false, requiresWallet, ...props }) => {
    const { signer } = useContext(AccountContext);
    const buttonRef = useRef();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <ButtonContainer 
            {...props} 
            ref={buttonRef} 
            onMouseOver={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            onClick={(requiresWallet && !signer) || props.isDisabled ? () => {} : props.onClick}
            isDisabled={props.isDisabled || requiresWallet && !signer}
        >
            {
                isLoading ?
                    <Spinner invert/>
                    : children
            }

            {
                isHovered && requiresWallet && !signer &&
                    <InfoBubble style={{ width: "100%" }} parentRef={buttonRef}>
                        <Text style={{ color: "white" }}>
                            Connect your wallet to start trading    
                        </Text>
                    </InfoBubble>
            }
        </ButtonContainer>
    );
}

const StyledTextButton = styled.div`
    color: ${({ theme }) => theme.colors.primary};
    width: fit-content;
    display: grid;
    align-items: center;
    justify-items: center;
    transition: transform 0.1s ease-out, color 0.1s ease-out;
    user-select: none;

    &:hover {
        cursor: pointer;
        color: ${({ theme }) => theme.colors.secondary};
    }

    &:active {
        transform: scale(0.95);
    }
`;

export const TextButton = ({ requiresWallet, ...props }) => {
    const { signer } = useContext(AccountContext) ?? {};

    return (
        <div style={props.style}>
            {
                props.isLoading ?
                    <BarSpinner/>
                    : <StyledTextButton  
                        {...props} 
                        onClick={requiresWallet && !signer ? () => {} : props.onClick}
                    />
            }
        </div>
    );
}