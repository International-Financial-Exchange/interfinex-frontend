import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";
import { ExpandArrowIcon } from "./ExpandArrowIcon";

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

    .expand-arrow {
        transition: all 0.1s ease-out;
        position: absolute;
        height: ${PIXEL_SIZING.small};
        right: ${PIXEL_SIZING.medium};
    }

    &:hover {
        cursor: pointer;
        background-color: ${({ theme, secondary }) => !secondary ? theme.colors.highlight : ''};
        border-color: ${({ theme, secondary }) => secondary ? theme.colors.primary : ''};

        .expand-arrow {
            right: ${PIXEL_SIZING.small};
        }
    }
`;

export const ContentAndArrow = ({ children, ...props }) => {
    return (
        <Container {...props}>
            <div style={{ marginRight: PIXEL_SIZING.medium }}>
                { children }
            </div>

            <ExpandArrowIcon className={"expand-arrow"}/>
        </Container>
    );
};