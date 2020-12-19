import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

export const InputAndLabel = styled.div`
    display: grid;
    row-gap: ${PIXEL_SIZING.small};
    height: fit-content;
    align-items: start;
`;