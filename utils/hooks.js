import { ethers } from "ethers";
import { useCallback, useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/Account";
import { EthersContext } from "../context/Ethers";
import { hasAllowance } from "./utils";

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

export const useAuthorizeContract = (contractsToApprove, targetContract) => {
    const { signer, } = useContext(EthersContext);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (contract && signer) {
            // const isAuthorized = await contract.isAuthorized();
            console.log(isAuthorized);
        }
    }, [signer, contract]);
};

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

                console.log("allowance", allowances, token)
                const hasAllowance = allowances[token.address];

                console.log("allowance", hasAllowance)
                if (!hasAllowance) {
                    await token.contract.connect(signer).approve(contract.address, ethers.constants.MaxUint256,);
                }
            })
        );
    };

    const updateAllowances = async () => {
        setAllowances({});
        await Promise.all(tokens.map(async token => {
            if (!token) return;

            const _hasAllowance = hasAllowance(await token.contract.allowance(address, contract.address));
            
            setAllowances(oldState => {
                const newState = _.cloneDeep(oldState);
                newState[token.address] = _hasAllowance;
                return newState;
            });
        }))
    };

    useEffect(() => {
        if (contract && address) {
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

export const useDocument = () => {
    const [_document, setDocument] = useState();

    useEffect(() => {
        setDocument(document);
    }, []);

    return _document;
};