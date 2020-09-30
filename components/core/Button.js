import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";
import { BarSpinner } from "./Spinner";

export default styled.div`
    border-radius: 4px;
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
        cursor: pointer;
        opacity: 0.95;
    }

    &:active {
        transform: scale(0.95);
    }
`;

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

export const TextButton = props => {
    return (
        <div style={props.style}>
            {
                props.isLoading ?
                    <BarSpinner/>
                    : <StyledTextButton {...props}/>
            }
        </div>
    );
}