import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

export const ModalCard = styled.div`
    background-color: ${({ theme }) => theme.colors.invert};
    padding: ${({ padding }) => padding ? PIXEL_SIZING.microscopic : ''};
    box-shadow: ${({ theme }) => theme.colors.primaryBoxShadow};
    width: fit-content;
    height: fit-content;
    border-radius: ${PIXEL_SIZING.miniscule};
`;