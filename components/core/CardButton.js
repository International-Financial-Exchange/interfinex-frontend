import styled from "styled-components";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../utils/constants";

export const CardButton = styled.div`
    border-radius: ${PIXEL_SIZING.miniscule};
    box-shadow: ${({ theme }) => theme.colors.primaryBoxShadow};
    display: grid;
    row-gap: ${PIXEL_SIZING.small};
    height: fit-content;
    padding: ${PIXEL_SIZING.small};
    border: 2px solid ${({ theme }) => theme.colors.invert};
    transition: transform 0.1s ease-out, opacity 0.08s ease-out;
    user-select: none;

    &:hover {
        border: 2px solid ${({ theme }) => theme.colors.primary};
        cursor: pointer;
    }

    &:active {
        transform: ${({ isDisabled }) => !isDisabled ? "scale(0.95)" : ""};
    }
`;