import ReactDOM from "react-dom";
import { ModalCard } from "../core/ModalCard";
import styled from "styled-components";
import { useEffect } from "react";
import { MODAL_ID } from "./Modal";
import { dropinAnimation, PIXEL_SIZING, } from "../../utils/constants";
import { useDocument } from "../../utils/hooks";

export const DropdownItem = styled.div`
    padding: ${PIXEL_SIZING.medium};
    border-radius: ${PIXEL_SIZING.miniscule};

    &:hover {
        cursor: pointer;
        background-color: ${({ theme }) => theme.colors.highlight}
    }
`;

const DropdownContainer = styled.div`
    position: absolute; 
    width: fit-content; 
    height: fit-content;
    
    box-shadow: ${({ theme }) => theme.colors.primaryBoxShadow};
    animation: ${dropinAnimation} 0.05s ease-out forwards;
`;

export const Dropdown = ({ children, parentRef, left=false, right=false, center=true, onClose = () => {} }) => {
    const document = useDocument();
    const parentCoords = parentRef.current?.getBoundingClientRect() ?? {};
    const CONTAINER_ID = "dropdown-container";
    
    useEffect(() => {
        const handleClick = e => {
            const isContainerClick = e.composedPath().some(({ id }) => id === CONTAINER_ID || id === MODAL_ID);
            if (!isContainerClick) onClose();
        };

        if (document) {
            document.addEventListener("click", handleClick);
            return () => document.removeEventListener("click", handleClick);
        };
    }, [document]);
    
    return (
        !document 
            ? null
            : ReactDOM.createPortal(
                <DropdownContainer 
                    id={CONTAINER_ID}
                    style={{ 
                        right: left ? parentCoords.y : '', 
                        left: right ? parentCoords.left : '', 
                        top: parentCoords.bottom + 13
                    }}
                >
                    <ModalCard>
                        { children }
                    </ModalCard>
                </DropdownContainer>,
                document.getElementById("root")
            )
    );
};