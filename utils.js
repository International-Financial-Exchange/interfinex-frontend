import { useState, useEffect, useCallback, useContext } from "react";
import { keyframes } from "styled-components";
import { ethers, BigNumber } from "ethers";
import { SERVER_URL } from "./ENV";
import { AccountContext } from "./context/Account";
import { EthersContext } from "./context/Ethers";
import { add, update } from "lodash";

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

export const sizingToInt = size => {
    return parseInt(size.slice(0, size.length - 2));
};

export const hasAllowance = allowance => allowance.gte(ethers.constants.MaxUint256.div(BigNumber.from('100')));

export const useDocument = () => {
    const [_document, setDocument] = useState();

    useEffect(() => {
        setDocument(document);
    }, []);

    return _document;
};

export const isZeroAddress = address => 
    address === ethers.constants.AddressZero;

export const useWindow = () => {
    const [_window, setWindow] = useState();

    useEffect(() => {
        setWindow(window);
    }, []);

    return _window;
};

export const useForceUpdate = () => {
    const [, setTick] = useState(0);
    const update = useCallback(() => {
      setTick(tick => tick + 1);
    }, [])
    return update;
  }

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

// removed truncation here as it broke small amounts - may need to add back in properly
export const parseTokenAmount = (amount, token) => {
    return ethers.utils.parseUnits(amount.toString(), token.decimals).toString();
};

export const humanizeTokenAmount = (amount, token) => parseFloat(ethers.utils.formatUnits(amount.toString(), token.decimals));

export const MULTIPLIER = BigNumber.from(parseTokenAmount(1, 18));

export const getRequest = (endpoint, params = {}, isJSON = true) => {
    const urlParams = Object.entries(params).reduce(
        (paramsStr, [key, value]) => value ? paramsStr.concat(`&${key}=${value}`) : paramsStr, 
        ""
    );

    const url = `${SERVER_URL}${endpoint}?${urlParams}`;
    console.log(url);

    if (isJSON) 
        return fetch(url).then(res => res.json());

    return fetch(url);
};

export const TIMEFRAMES = {
    ["1m"]: 1000 * 60,
    ["15m"]: 1000 * 60 * 15,
    ["1h"]: 1000 * 60 * 60,
    ["4h"]: 1000 * 60 * 60 * 4,
    ["1d"]: 1000 * 60 * 60 * 24,
};


export const FEE_RATE = 0.001;

// TODO: Memoize these functions - IMPORTANT!
export const useContractApproval = (contract, propTokens = []) => {
    const { address } = useContext(AccountContext);
    const { signer, contracts: { createContract }} = useContext(EthersContext);
    const [allowances, setAllowances] = useState();
    const [tokens, setTokens] = useState([]);

    const approveContract = async (...tokensToApprove) => {
        if (tokensToApprove.length === 0) 
            tokensToApprove = tokens;

        await Promise.all(
            tokensToApprove.map(async token => {
                if (!tokensToApprove.every(v => v)) 
                    throw Error("Tokens have not loaded", tokensToApprove);

                if (token.name === "Ethereum") return;

                const { hasAllowance } = allowances[token.address];
                if (!hasAllowance) 
                    await token.contract.connect(signer).approve(contract.address, ethers.constants.MaxUint256,);
            })
        );
    };

    const updateAllowances = async () => {
        setAllowances({});
        await Promise.all(tokens.map(async token => {
            const _hasAllowance = hasAllowance(await token.contract.balanceOf(contract.address));
            
            setAllowances(oldState => {
                const newState = _.cloneDeep(oldState);
                newState[token.address] = _hasAllowance;
                return newState;
            });
        }))
    };

    useEffect(() => {
        if (contract && address && tokens.every(v => v)) {
            updateAllowances();
        }
    }, [contract?.address, address, tokens]);

    useEffect(() => {
        // If prop tokens contains a new token
        if (!propTokens.every(propToken => tokens.some(token => propToken?.address === token?.address))) {
            setTokens(propTokens);
        }
    }, [propTokens]);

    return { approveContract };
};