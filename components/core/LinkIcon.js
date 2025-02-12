import styled from "styled-components";
import { PIXEL_SIZING } from "../../utils/constants";

const Container = styled.svg`
    height: ${PIXEL_SIZING.small};
    width: ${PIXEL_SIZING.small};

    &:hover {
        cursor: pointer;
    }

    &:active {
        transform: scale(0.95);
    }

    transition: all 0.1s ease-out;

    path {
        fill: ${({ theme, isHovered }) => !isHovered ? theme.colors.textPrimary : theme.colors.primary};
        stroke: ${({ theme, isHovered }) => !isHovered ? theme.colors.textPrimary : theme.colors.primary};
    }
`;

export const LinkIcon = props => {
    return (
        <Container 
            version="1.1" 
            id="Layer_1" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512" 
            {...props}
        >
            <g>
                <g>
                    <path d="M488.727,0H302.545c-12.853,0-23.273,10.42-23.273,23.273c0,12.853,10.42,23.273,23.273,23.273h129.997L192.999,286.09
                        c-9.089,9.089-9.089,23.823,0,32.912c4.543,4.544,10.499,6.816,16.455,6.816c5.956,0,11.913-2.271,16.457-6.817L465.455,79.458
                        v129.997c0,12.853,10.42,23.273,23.273,23.273c12.853,0,23.273-10.42,23.273-23.273V23.273C512,10.42,501.58,0,488.727,0z"/>
                </g>
            </g>
            <g>
                <g>
                    <path d="M395.636,232.727c-12.853,0-23.273,10.42-23.273,23.273v209.455H46.545V139.636H256c12.853,0,23.273-10.42,23.273-23.273
                        S268.853,93.091,256,93.091H23.273C10.42,93.091,0,103.511,0,116.364v372.364C0,501.58,10.42,512,23.273,512h372.364
                        c12.853,0,23.273-10.42,23.273-23.273V256C418.909,243.147,408.489,232.727,395.636,232.727z"/>
                </g>
            </g>
        </Container>
    );
}