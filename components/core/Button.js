import styled from "styled-components";
import { BarSpinner, Spinner } from "./Spinner";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccountContext } from "../../context/Account";
import Text from "./Text";
import { EthersContext } from "../../context/Ethers";
import ReactDOM from "react-dom";
import { dropinAnimation, PIXEL_SIZING } from "../../utils/constants";
import { ArrowDirection } from "./ArrowDirection";

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
    color: white;
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

export const HoverInfoBubble = ({ children, parentRef, ...props }) => {
    const { x, y, height, width } = parentRef.current?.getBoundingClientRect() ?? {};

    return (
        ReactDOM.createPortal(
            <InfoBubbleContainer 
                {...props} 
                style={{ 
                    ...props.style,
                    left: props.style?.left ? x + props.style.left : x, 
                    top: y + height + 8, 
                    width: props.style?.width === "100%" ? width : "fit-content",
                }}
            >
                {children}
            </InfoBubbleContainer>,
            document.getElementById("root"),
        )
    );
};

export const Button = ({ children, primary, isLoading = false, requiresWallet, ...props }) => {
    const { signer } = useContext(EthersContext);
    const buttonRef = useRef();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <ButtonContainer 
            ref={buttonRef} 
            onMouseOver={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
            {...props} 
            style={{ 
                height: primary ? PIXEL_SIZING.larger : '',
                ...props.style,
            }}
            onClick={(requiresWallet && !signer) || props.isDisabled ? () => {} : props.onClick}
            isDisabled={props.isDisabled || requiresWallet && !signer}
        >
            {
                isLoading ?
                    <Spinner invert/>
                    : primary ? 
                        <Text primary style={{ color: "white", fontSize: 15 }}>{children}</Text> 
                        : children
            }

            {
                isHovered && requiresWallet && !signer &&
                    <HoverInfoBubble style={{ width: "100%" }} parentRef={buttonRef}>
                        <Text style={{ color: "white" }}>
                            Connect your wallet  
                        </Text>
                    </HoverInfoBubble>
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
    font-size: ${({ primary }) => primary ? PIXEL_SIZING.large : ""};

    &:hover {
        cursor: pointer;
        color: ${({ theme }) => theme.colors.secondary} !important;
    }

    &:active {
        transform: scale(0.95);
    }
`;

export const TextButton = ({ requiresWallet, ...props }) => {
    const { signer } = useContext(EthersContext) ?? {};

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

const StyledArrowButton = styled.div`
    color: ${({ theme }) => theme.colors.textPrimary};
    width: fit-content;
    transition: transform 0.1s ease-out;
    user-select: none;
    position: relative;
    margin-right: 25px;

    .arrow-direction {
        position: absolute;
        top: 50%;
        transform: translateY(-50%) rotate(180deg);
        transition: right 0.1s ease-out;
        right: -17px;
    }
    
    &:hover {
        .arrow-direction {
            right: -21px;

            path {
                fill: ${({ theme }) => theme.colors.secondary} !important;
                stroke: ${({ theme }) => theme.colors.secondary} !important;
            }
        }

        color: ${({ theme }) => theme.colors.secondary} !important;
        cursor: pointer;
    }
`;

export const ArrowButton = props => {
    return (
        <StyledArrowButton {...props}>
            { props.children }
            <ArrowDirection className={"arrow-direction"}/>
        </StyledArrowButton>
    );
};

export const AddButton = ({ children, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);
    const childRef = useRef();
    const [width, setWidth] = useState(0);
    const [isLoaded, setIsLoaded] = useState();
    const [isMobileView, setIsMobileView] = useState();
    
    useLayoutEffect(() => {
        setIsMobileView(window.innerWidth < 600);
        setWidth(childRef.current.getBoundingClientRect().width);
    });

    return (
        <Button 
            {...props} 
            onMouseOver={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                borderRadius: 1000, 
                width: "fit-content", 
                padding: 0,
                overflow: "hidden",
                ...props.style, 
            }}
        >
            <div style={{ width: isMobileView ? "fit-content" : width, transition: "width 0.17s ease-out", }}>
                <div style={{ display: "flex", width: "fit-content", padding: PIXEL_SIZING.small }} ref={childRef}>
                    <img
                        onLoad={() => setIsLoaded(true)}
                        src={"/plus.svg"}
                        style={{
                            transform: isHovered ? "rotate(90deg)" : "",
                            transition: "transform 0.3s ease-out",
                        }}
                        height={PIXEL_SIZING.medium}
                    />

                    {
                        (isHovered || isMobileView) &&
                            <div style={{ marginLeft: PIXEL_SIZING.small, alignSelf: "center", whiteSpace: "nowrap", }}>
                                {children}
                            </div>
                    }
                </div>
            </div>
        </Button>
    );
};