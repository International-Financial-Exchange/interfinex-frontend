import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export const TextOption = styled.div`
    color: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.highlight};
    transition: all 0.08s ease-out;
    font-weight: bold;
    padding: ${PIXEL_SIZING.tiny};
    user-select: none;

    &:hover {
        cursor: pointer;
        color: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary};
    }
`;