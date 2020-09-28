import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export const Input = styled.input`
    border-radius: ${PIXEL_SIZING.miniscule};
    border: 2px solid ${({ theme, isError }) => isError ? theme.colors.negative : theme.colors.highlight};
    padding: ${PIXEL_SIZING.small};
    font-size: ${PIXEL_SIZING.small};
    width: 100%;
    box-shadow: 10px 10px 20px -13px rgba(0,0,0,0.1);

    &:focus {
        border: 2px solid ${({ theme, isError }) => isError ? theme.colors.negative : theme.colors.primary};
    }
`;