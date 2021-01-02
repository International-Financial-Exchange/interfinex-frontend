import { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";
import { useDocument } from '../../utils/hooks';
import { PIXEL_SIZING } from '../../utils/constants';
import styled from "styled-components";

const CloseModalContext = React.createContext();

export const MODAL_ID = "MODAL";

const TopRightContainer = styled.div`
    position: absolute;
    top: ${PIXEL_SIZING.huge};
    right: ${PIXEL_SIZING.medium};

    @media (max-width: 1000px) {
        display: grid;
        justify-items: right;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        padding: 0 ${PIXEL_SIZING.small};
    }
`;

const CenterContainer = styled.div`
    position: absolute;
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%);
`

export const Modal = ({ isOpen, onClose = _.noop, children, topRight, showBackdrop = true }) => {
    const document = useDocument();

    const Container = topRight ? 
        TopRightContainer
        : CenterContainer;

    return (
        isOpen && document ? 
            ReactDOM.createPortal(
                <CloseModalContext.Provider value={onClose}>
                    <div 
                        style={{ position: 'fixed', height: '100%', width: '100%', zIndex: 100, backgroundColor: showBackdrop ? "rgba(0, 0, 0, 0.7)" : "transparent", top: 0, left: 0, }}
                        id={MODAL_ID}
                        onClick={e => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <Container 
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        >
                            {_.isFunction(children) ? children(onClose) : children}
                        </Container>
                    </div>
                </CloseModalContext.Provider>,
                document.getElementById("root")
            )
        : 
            <></>
    )
};