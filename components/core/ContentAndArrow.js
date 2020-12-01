import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

const Container = styled.div`
    display: grid; 
    grid-template-columns: 1fr auto; 
    column-gap: ${PIXEL_SIZING.tiny}; 
    align-items: center; 
    position: relative;
    padding: ${PIXEL_SIZING.small};
    border-radius: ${PIXEL_SIZING.miniscule};
    transition: all 0.1s ease-out;
    border: ${({ secondary, theme }) => secondary ? `1px solid ${theme.colors.highlight}` : ''};

    .arrow {
        transition: all 0.1s ease-out;
        position: absolute;
        height: ${PIXEL_SIZING.medium};
        transform: rotate(270deg);
        right: ${PIXEL_SIZING.medium};
    }

    &:hover {
        cursor: pointer;
        background-color: ${({ theme, secondary }) => !secondary ? theme.colors.highlight : ''};
        border-color: ${({ theme, secondary }) => secondary ? theme.colors.primary : ''};

        .arrow {
            right: ${PIXEL_SIZING.small};
        }
    }
`;

export const ContentAndArrow = ({ children, ...props }) => {
    return (
        <Container {...props}>
            <div style={{ marginRight: PIXEL_SIZING.larger }}>
                { children }
            </div>

            <img
                className={"arrow"}
                src={"/expand-arrow-light-theme.png"}
            />
        </Container>
    );
};