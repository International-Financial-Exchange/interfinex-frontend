import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils";

const CrossContainer = styled.div`
    width: fit-content;
    transition: all 0.1s ease-out;

    &:hover {
        cursor: pointer;
        opacity: 0.8;
    }

    &:active {
        transform: scale(0.8);
    }
`;

export const Cross = props => {
    return (
        <CrossContainer {...props}>
            <img
                src={"/cross-light-theme.png"}
                style={{ height: props.style.height ?? PIXEL_SIZING.large }}
            />
        </CrossContainer>
    );
};