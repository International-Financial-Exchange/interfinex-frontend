import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
    const [provider, setProvider] = useState();
    const [signer, setSigner] = useState();

    useEffect(() => {
        setProvider(new ethers.providers.getDefaultProvider());
    }, []);
    
    return (
        <EthersContext.Provider value={{ provider, signer, setProvider, setSigner }}>
            { children }
        </EthersContext.Provider>
    );
}
