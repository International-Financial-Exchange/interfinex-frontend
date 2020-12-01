import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

const Container = styled.div`
    transform: rotate(180deg);
    transition: all 0.1s ease-out;

    &:active {
        transform: rotate(180deg) scale(0.9);
    }

    &:hover {
        cursor: pointer;
    }
`;

export const ArrowDirection = props => {
    return (
        <Container {...props}>
            <img 
                style={{ height: PIXEL_SIZING.medium }}
                src={"/arrow-direction-light-theme.png"}
            />
        </Container>
    );
};