import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

export const Card = styled.div`
    border-radius: ${PIXEL_SIZING.tiny};
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    padding: ${PIXEL_SIZING.small};
    display: grid;
    width: fit-content;
`