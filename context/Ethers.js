import { ethers, } from "ethers";
import { createContext, useState, useEffect, useMemo, } from "react";
import FactoryContract from "../public/contracts/Factory.json";
import ERC20Contract from "../public/contracts/ERC20.json";
import DividendERC20Contract from "../public/contracts/DividendERC20.json";

import LocalFactoryContract from "../public/local-net/Factory.json";
import LocalERC20Contract from "../public/local-net/ERC20.json";

import LocalImebToken from "../public/local-net/IMEBToken.json";
import ImebToken from "../public/contracts/IMEBToken.json";

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
    const [provider, setProvider] = useState(new ethers.providers.getDefaultProvider("http://localhost:7545"));
    const [networkInfo, setNetworkInfo] = useState();

    const signer = useMemo(() => {
        return provider?.getSigner();
    }, [provider]);

    // There will only ever be 1 instance of the factory contract so 
    // we can return a fully fledged "instance" of that contract;
    // Every other contract returned will just be the ABI file that has to
    // be instantiated as a contract in the code with the relevant address.
    const [factoryContract,  imebTokenContract, erc20ContractAbi] = useMemo(() => {
        return (
            networkInfo?.chainId === 1 ?
                [
                    new ethers.Contract(FactoryContract.address, FactoryContract.abi, signer),
                    new ethers.Contract(ImebToken.address, DividendERC20Contract.abi, signer),
                    ERC20Contract.abi
                ]
            : 
                [
                    new ethers.Contract(LocalFactoryContract.address, LocalFactoryContract.abi, signer),
                    new ethers.Contract(LocalImebToken.address, DividendERC20Contract.abi, signer),
                    LocalERC20Contract.abi
                ]
        );
    }, [networkInfo, signer]);

    useEffect(() => { 
        provider?.getNetwork().then(network => setNetworkInfo(network));
    }, [provider]);

    return (
        <EthersContext.Provider 
            value={{ 
                provider, 
                setProvider,
                networkInfo,
                contracts: {
                    factoryContract,
                    imebTokenContract,
                    erc20ContractAbi,
                }
            }}
        >
            { children }
        </EthersContext.Provider>
    );
}
