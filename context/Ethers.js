import { ethers, } from "ethers";
import { createContext, useState, useEffect, useMemo, } from "react";

import FactoryContract from "../public/contracts/Factory.json";
import ExchangeContract from "../public/contracts/Exchange.json";
import ERC20Contract from "../public/contracts/ERC20.json";
import DividendERC20Contract from "../public/contracts/DividendERC20.json";
import IfexToken from "../public/contracts/IFEXToken.json";
import { ETH_NODE_URL } from "../ENV";

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
    console.log("url", ETH_NODE_URL)
    const [provider, setProvider] = useState(new ethers.providers.getDefaultProvider(ETH_NODE_URL));
    const [signer, setSigner] = useState();
    const [networkInfo, setNetworkInfo] = useState();

    // There will only ever be 1 instance of the factory contract so 
    // we can return a fully fledged "instance" of that contract;
    // Every other contract returned will just be the ABI file that has to
    // be instantiated as a contract in the code with the relevant address.
    const [factoryContract,  ifexTokenContract, erc20ContractAbi, exchangeContractAbi, dividendErc20ContractAbi] = useMemo(() => {
        return (
            [
                new ethers.Contract(FactoryContract.address, FactoryContract.abi, signer || provider),
                new ethers.Contract(IfexToken.address, DividendERC20Contract.abi, signer || provider),
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
                signer,
                setSigner,
                setProvider,
                networkInfo,
                contracts: {
                    factoryContract,
                    ifexTokenContract,
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
