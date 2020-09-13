import { useState, useEffect } from "react";

export const PIXEL_SIZING = {
    microscopic: '3px',
    miniscule: '5px',
    tiny: '8px',
    small: '13px',
    medium: '21px',
    large: '34px',
    larger: '55px',
    huge: '89px',
    humungous: '144px',
};

export const useDocument = () => {
    const [_document, setDocument] = useState();

    useEffect(() => {
        setDocument(document);
    }, []);

    return _document;
};