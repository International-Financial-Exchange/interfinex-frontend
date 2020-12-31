import { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";
import { useDocument } from '../../utils/hooks';
import { PIXEL_SIZING } from '../../utils/constants';

const CloseModalContext = React.createContext();

export const MODAL_ID = "MODAL";

export const Modal = ({ isOpen, onClose = _.noop, children, topRight, showBackdrop = true }) => {
    const document = useDocument();

    const style = topRight ? 
        {
            position: "absolute",
            top: PIXEL_SIZING.huge,
            right: PIXEL_SIZING.medium,
        }
    : 
        {
            position: "absolute",
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)",
        };

    return (
        isOpen && document ? 
            ReactDOM.createPortal(
                <CloseModalContext.Provider value={onClose}>
                    <div 
                        style={{ position: 'fixed', height: '100%', width: '100%', zIndex: 100, backgroundColor: showBackdrop ? "rgba(0, 0, 0, 0.7)" : "transparent" }}
                        id={MODAL_ID}
                        onClick={e => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <div 
                            style={style} 
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        >
                            {_.isFunction(children) ? children(onClose) : children}
                        </div>
                    </div>
                </CloseModalContext.Provider>,
                document.getElementById("root")
            )
        : 
            <></>
    )
};