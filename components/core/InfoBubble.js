import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

export const InfoBubble = styled.div`
    padding: ${PIXEL_SIZING.small};
    transition: all 0.1s ease-out;

    background-color: ${({ theme, }) => theme.colors.blue};
    border: 1px solid ${({ theme }) => theme.colors.blue};
    border-radius: ${PIXEL_SIZING.miniscule};
    color: ${({ theme }) => "white"};

    &:hover {
        transform: scale(1.01);
    }
`;