import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

export const ModalCard = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    padding: ${({ padding }) => padding ? PIXEL_SIZING.microscopic : ''};
    width: fit-content;
    height: fit-content;
    border-radius: ${PIXEL_SIZING.miniscule};
`