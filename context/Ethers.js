import { ethers, } from "ethers";
import { createContext, useState, useEffect, useMemo, } from "react";
import FactoryContract from "../public/contracts/Factory.json";
import ERC20Contract from "../public/contracts/ERC20.json";

import LocalFactoryContract from "../public/local-net/Factory.json";
import LocalERC20Contract from "../public/local-net/ERC20.json";

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
    const [provider, setProvider] = useState(new ethers.providers.getDefaultProvider("http://localhost:7545"));
    const [signer, setSigner] = useState();
    const [networkInfo, setNetworkInfo] = useState();

    // There will only ever be 1 instance of the factory contract so 
    // we can return a fully fledged "instance" of that contract;
    // Every other contract returned will just be the ABI file that has to
    // be instantiated as a contract in the code with the relevant address.
    const [factoryContract, erc20ContractABI] = useMemo(() => {
        return (
            networkInfo?.chainId === 1 ?
                [
                    new ethers.Contract(FactoryContract.address, FactoryContract.abi, provider),
                    ERC20Contract.abi
                ]
            : 
                [
                    new ethers.Contract(LocalFactoryContract.address, LocalFactoryContract.abi, provider),
                    LocalERC20Contract.abi
                ]
        );
    }, [networkInfo]);

    useEffect(() => { 
        provider?.getNetwork().then(network => setNetworkInfo(network));
    }, [provider]);

    return (
        <EthersContext.Provider 
            value={{ 
                provider, 
                signer, 
                setProvider, 
                setSigner,
                networkInfo,
                contracts: {
                    factoryContract,
                    erc20ContractABI,
                }
            }}
        >
            { children }
        </EthersContext.Provider>
    );
}
