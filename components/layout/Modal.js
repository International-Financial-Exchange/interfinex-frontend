import { useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import _ from "lodash";
import { useDocument } from '../../utils';

const CloseModalContext = React.createContext();

export const MODAL_ID = "MODAL";

export const Modal = ({ isOpen, onClose = _.noop, children }) => {
    const document = useDocument();

    console.log("show", isOpen && document);
    console.log("open", isOpen);

    return (
        isOpen && document ? 
            ReactDOM.createPortal(
                <CloseModalContext.Provider value={onClose}>
                    <div 
                        style={{ position: 'fixed', height: '100%', width: '100%', zIndex: 100, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                        id={MODAL_ID}
                        onClick={e => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <div 
                            style={{ 
                                position: "absolute",
                                top: "50%", 
                                left: "50%", 
                                transform: "translate(-50%, -50%)",
                            }} 
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                console.log("hello")
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