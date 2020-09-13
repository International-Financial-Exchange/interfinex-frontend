import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export const Card = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    padding: ${({ padding }) => padding ? PIXEL_SIZING.medium : ''};
    box-shadow: ${({ theme }) => theme.colors.boxShadow};
    width: fit-content;
    height: fit-content;
    border-radius: ${PIXEL_SIZING.miniscule};
`