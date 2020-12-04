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
import SwapEthRouterAbi from "../public/contracts/abi/SwapEthRouter.json";
import MarginEthRouterAbi from "../public/contracts/abi/MarginEthRouter.json";
import YieldFarmAbi from "../public/contracts/abi/YieldFarm.json";
import { formatEther, parseEther } from "ethers/lib/utils";

const ABI = {
    DividendERC20: DividendERC20Abi,
    ERC20: ERC20Abi,
    MarginFactory: MarginFactoryAbi,
    MarginMarket: MarginMarketAbi,
    SwapExchange: SwapExchangeAbi,
    SwapFactory: SwapFactoryAbi,
    SwapEthRouter: SwapEthRouterAbi,
    MarginEthRouter: MarginEthRouterAbi,
    YieldFarm: YieldFarmAbi,
};

export const EthersContext = createContext();

export const EthersProvider = ({ children }) => {
    const [provider, setProvider] = useState(new ethers.providers.InfuraWebSocketProvider("homestead", "f6a09cc8f51c45d2bd74137004115dbf"));
    const [signer, setSigner] = useState();
    const [networkInfo, setNetworkInfo] = useState({ name: "mainnet" });
    const [blockNumber, setBlockNumber] = useState();

    const contracts = CONTRACTS[networkInfo.name] ?? CONTRACTS["mainnet"];
    const getAbi = abiName => ABI[abiName];

    const { 
        IfexToken, 
        SwapFactory,  
        MarginFactory,
        SwapEthRouter,
        MarginEthRouter,
        YieldFarm,
    } = useMemo(() => {
        return {
            IfexToken: new ethers.Contract(contracts.IfexToken.address, getAbi("DividendERC20"), signer || provider),
            SwapFactory: new ethers.Contract(contracts.SwapFactory.address, getAbi("SwapFactory"), signer || provider),
            MarginFactory: new ethers.Contract(contracts.MarginFactory.address, getAbi("MarginFactory"), signer || provider),
            SwapEthRouter: new ethers.Contract(contracts.SwapEthRouter.address, getAbi("SwapEthRouter"), signer || provider),
            MarginEthRouter: new ethers.Contract(contracts.MarginEthRouter.address, getAbi("MarginEthRouter"), signer || provider),
            YieldFarm: new ethers.Contract(contracts.YieldFarm.address, getAbi("YieldFarm"), signer || provider),
        }
    }, [networkInfo, signer]);

    const TestnetTokens = Array(4).fill().map((_, i) => ({
        name: `Token${i}`,
        symbol: `T${i}`,
        decimals: 18,
        address: contracts[`Token${i}`]?.address,
        logoURI: "/metamask-logo.png"
    })).concat({
        name: `WrappedEther`,
        symbol: `WETH`,
        decimals: 18,
        address: contracts[`WrappedEther`]?.address,
        logoURI: "/metamask-logo.png"
    });

    const ETHEREUM_TOKEN = useMemo(() => {
        return {
            address: contracts[`WrappedEther`].address,
            name: "Ethereum",
            decimals: 18,
            symbol: "ETH",
            logoURI: "https://ethereum.org/static/a183661dd70e0e5c70689a0ec95ef0ba/31987/eth-diamond-purple.png",
        }
    }, [contracts]);

    useEffect(() => { 
        provider?.getNetwork().then(network => setNetworkInfo(network));
    }, [provider]);

    useEffect(() => {
        provider.getBlockNumber().then(blockNumber => {
            setBlockNumber(blockNumber);
        });
    })

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
                blockNumber,
                contracts: {
                    IfexToken,
                    SwapFactory,
                    MarginFactory,
                    SwapEthRouter,
                    MarginEthRouter,
                    YieldFarm,
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
