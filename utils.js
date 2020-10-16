import { useState, useEffect } from "react";
import { keyframes } from "styled-components";
import { ethers, BigNumber } from "ethers";

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

export const CONTAINER_SIZING = {
    microscopic: '55px',
    miniscule: '89px',
    tiny: '144px',
    small: '233px',
    medium: '377px',
    large: '610px',
    larger: '987px',
    huge: '1597px',
};

export const useDocument = () => {
    const [_document, setDocument] = useState();

    useEffect(() => {
        setDocument(document);
    }, []);

    return _document;
};

export const useWindow = () => {
    const [_window, setWindow] = useState();

    useEffect(() => {
        setWindow(window);
    }, []);

    return _window;
};

export const useLocalStorage = (key, initialValue) => {
    const window = useWindow();

    const [storedValue, setStoredValue] = useState();
  
    const setValue = value => {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        window?.localStorage.setItem(key, JSON.stringify(valueToStore));
        setStoredValue(valueToStore);
    };

    useEffect(() => {
        setStoredValue(() => {
            const item = window?.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        });
    }, [window]);
  
    return [storedValue, setValue];
};

export const dropinAnimation = keyframes`
    from {
        opacity: 0.7;
        transform: scale(0.7);
    }

    to {
        opacity: 1;
        transform: scale(1.0);
    }
`;

Array.prototype.first = function() {
    return this[0] != null ? JSON.parse(JSON.stringify(this[0])) : this[0];
};

Array.prototype.last = function() {
    return this[this.length - 1] != null ? JSON.parse(JSON.stringify(this[this.length - 1])) : this[this.length - 1];
};

const hex2 = c => {
    c = Math.round(c);
    if (c < 0) c = 0;
    if (c > 255) c = 255;
    var s = c.toString(16);
    if (s.length < 2) s = "0" + s;
    return s;
}

const color = (r, g, b) => {
    return "#" + hex2(r) + hex2(g) + hex2(b);
}

export const shade = (col, light)=> {
    var r = parseInt(col.substr(1, 2), 16);
    var g = parseInt(col.substr(3, 2), 16);
    var b = parseInt(col.substr(5, 2), 16);
    if (light < 0) {
        r = (1 + light) * r;
        g = (1 + light) * g;
        b = (1 + light) * b;
    } else {
        r = (1 - light) * r + light * 255;
        g = (1 - light) * g + light * 255;
        b = (1 - light) * b + light * 255;
    }

    return color(r, g, b);
}

export const parseTokenAmount = (amount, token) => ethers.utils.parseUnits(amount.toString(), token.decimals).toString();
export const humanizeTokenAmount = (amount, token) => parseFloat(ethers.utils.formatUnits(amount.toString(), token.decimals));

export const MULTIPLIER = BigNumber.from(parseTokenAmount(1, 18));

export const getRequest = (endpoint, params = {}, isJSON = true) => {
    const urlParams = Object.entries(params).reduce(
        (paramsStr, [key, value]) => value ? paramsStr.concat(`&${key}=${value}`) : paramsStr, 
        ""
    );

    const url = `http://localhost:8080${endpoint}?${urlParams}`;

    if (isJSON) 
        return fetch(url).then(res => res.json());

    return fetch(url);
};

export const TIMEFRAMES = {
    ["1m"]: 1000 * 60,
    ["15m"]: 1000 * 60 * 15,
    ["4h"]: 1000 * 60 * 60 * 4,
    ["1d"]: 1000 * 60 * 60 * 24,
};


export const FEE_RATE = 0.003;