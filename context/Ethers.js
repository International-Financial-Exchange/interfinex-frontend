import { ethers, } from "ethers";
import { createContext, useState, useEffect, useMemo, } from "react";
import { ETH_NODE_URL } from "../ENV";
import CONTRACTS from "../public/contracts/contracts.json";
import DividendERC20Abi from "../public/contracts/abi/DividendERC20.json";
import ERC20Abi from "../public/contracts/abi/ERC20.json";
import MarginFactoryAbi from "../public/contracts/abi/MarginFactory.json";
import MarginMarketAbi from "../public/contracts/abi/MarginMarket.json";
import SwapExchangeAbi from "../public/contracts/abi/SwapExchange.json";
import SwapFactoryAbi from "../public/contracts/abi/SwapFactory.json";

const ABI = {
    DividendERC20: DividendERC20Abi,
    ERC20: ERC20Abi,
    MarginFactory: MarginFactoryAbi,
    MarginMarket: MarginMarketAbi,
    SwapExchange: SwapExchangeAbi,
    SwapFactory: SwapFactoryAbi,
};

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
    console.log("url", ETH_NODE_URL)
    const [provider, setProvider] = useState(new ethers.providers.getDefaultProvider(ETH_NODE_URL));
    const [signer, setSigner] = useState();
    const [networkInfo, setNetworkInfo] = useState({ name: "ganache" });

    const contracts = CONTRACTS[networkInfo.name] ?? CONTRACTS["ganache"];
    const getAbi = abiName => ABI[abiName];

    const { 
        IfexToken, 
        SwapFactory,  
        MarginFactory,
    } = useMemo(() => {
        return {
            IfexToken: new ethers.Contract(contracts.IfexToken.address, getAbi("DividendERC20"), signer || provider),
            SwapFactory: new ethers.Contract(contracts.SwapFactory.address, getAbi("SwapFactory"), signer || provider),
            MarginFactory: new ethers.Contract(contracts.MarginFactory.address, getAbi("MarginFactory"), signer || provider),
        }
    }, [networkInfo, signer]);

    const TestnetTokens = Array(4).fill().map((_, i) => ({
        name: `Token${i}`,
        symbol: `T${i}`,
        decimals: 18,
        address: contracts[`Token${i}`].address,
        logoURI: "/metamask-logo.png"
    })).concat({
        name: `WrappedEther`,
        symbol: `WETH`,
        decimals: 18,
        address: contracts[`WrappedEther`].address,
        logoURI: "/metamask-logo.png"
    });

    const ETHEREUM_TOKEN = useMemo(() => {
        return {
            address: contracts[`WrappedEther`].address,
            name: "Ethereum",
            decimals: 18,
            symbol: "ETH",
            logoURI: "/logo.png",
        }
    }, [contracts]);

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
                TestnetTokens,
                ETHEREUM_TOKEN,
                contracts: {
                    IfexToken,
                    SwapFactory,
                    MarginFactory,
                    getAbi,
                    createContract: (address, abiName) => 
                        new ethers.Contract(address, getAbi(abiName), signer || provider)
                },
            }}
        >
            { children }
        </EthersContext.Provider>
    );
}
