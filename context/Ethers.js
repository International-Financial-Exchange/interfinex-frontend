import { ethers, } from "ethers";
import { createContext, useState, useEffect, useMemo, } from "react";

import FactoryContract from "../public/contracts/Factory.json";
import ExchangeContract from "../public/contracts/Exchange.json";
import ERC20Contract from "../public/contracts/ERC20.json";
import DividendERC20Contract from "../public/contracts/DividendERC20.json";
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
    const [factoryContract,  imebTokenContract, erc20ContractAbi, exchangeContractAbi, dividendErc20ContractAbi] = useMemo(() => {
        return (
            [
                new ethers.Contract(FactoryContract.address, FactoryContract.abi, signer),
                new ethers.Contract(ImebToken.address, DividendERC20Contract.abi, signer),
                ERC20Contract.abi,
                ExchangeContract.abi,
                DividendERC20Contract.abi,
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
                    exchangeContractAbi,
                    dividendErc20ContractAbi
                }
            }}
        >
            { children }
        </EthersContext.Provider>
    );
}
