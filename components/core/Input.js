import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export const Input = styled.input`
    border-radius: ${PIXEL_SIZING.miniscule};
    border: 2px solid ${({ theme, isError, selected }) => isError ? 
        theme.colors.negative 
        : selected ?
            theme.colors.primary
            : theme.colors.highlight
    };
    padding: ${PIXEL_SIZING.small};
    font-size: ${PIXEL_SIZING.small};
    width: 100%;

    &:focus {
        border: 2px solid ${({ theme, isError }) => isError ? theme.colors.negative : theme.colors.primary};
    }
`;