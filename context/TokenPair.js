import { useRouter } from "next/router";

const { createContext, useState, useEffect, useContext, useMemo } = require("react");
import { tokens as InchTokens } from "../public/1InchTokenList.json";
import { tokens as LocalTokens } from "../public/contracts/local-tokens.json";
import { EthersContext } from "./Ethers";
import { ethers } from "ethers";
import { AccountContext } from "./Account";
export const TokenPairContext = createContext();


export const TokenPairProvider = ({ children }) => {
    const router = useRouter();
    const [tokens, setTokens] = useState();
    const { signer, networkInfo, provider, contracts: { erc20ContractAbi, imebTokenContract } } = useContext(EthersContext);

    const [assetToken, setAssetToken] = useState();
    const [baseToken, setBaseToken] = useState();
    const [imebToken, setImebToken] = useState();

    const IMEB_TOKEN = useMemo(() => {
        return {
            address: imebTokenContract.address,
            decimals: 18,
            name: "Intermex Bills",
            symbol: "IMEB",
            chainId: networkInfo?.chainId,
            contract: imebTokenContract,
            logoURI: "https://1inch.exchange/assets/tokens/0x0000000000b3f879cb30fe243b4dfee438691c04.png"
        }
    }, [imebTokenContract, networkInfo?.chainId]);

    useEffect(() => {
        const tokens = [IMEB_TOKEN].concat(networkInfo?.chainId === 1 ? InchTokens : LocalTokens);
        setTokens(tokens);
    }, [networkInfo?.chainId, imebTokenContract]);

    useEffect(() => {
        const {
            assetTokenName,
            assetTokenAddress, 
            assetTokenDecimals,
            assetTokenSymbol,
            baseTokenName,
            baseTokenAddress,
            baseTokenDecimals,
            baseTokenSymbol,
        } = router.query;

        if (tokens) {
            if (assetTokenName) {
                const assetToken = tokens.find(({ name }) => name === assetTokenName);
                if (assetToken) {
                    console.log(provider);
                    console.log("heloooooooooooooooooo", new ethers.Contract(assetToken.address, erc20ContractAbi, signer || provider));
                    setAssetToken({
                        ...assetToken,
                        contract: new ethers.Contract(assetToken.address, erc20ContractAbi, signer || provider),
                    });
                } else if (
                    assetTokenAddress && 
                    assetTokenDecimals &&
                    assetTokenSymbol
                ) {
                    setAssetToken({ 
                        name: assetTokenName,
                        symbol: assetTokenSymbol,
                        address: assetTokenAddress,
                        contract: new ethers.Contract(assetTokenAddress, erc20ContractAbi, signer || provider),
                        logoURI: "/custom-token-icon-light-theme.png"
                    });
                }
            } else {
                const assetTokenDefault = tokens[1];
                setAssetToken({
                    ...assetTokenDefault,
                    contract: new ethers.Contract(assetTokenDefault.address, erc20ContractAbi, signer || provider),
                });
            }
    
            if (baseTokenName) {
                const baseToken = tokens.find(({ name }) => name === baseTokenName);
                if (baseToken) {
                    setBaseToken({
                        ...baseToken,
                        contract: new ethers.Contract(baseToken.address, erc20ContractAbi, signer || provider),
                    });
                } else if (
                    baseTokenAddress && 
                    baseTokenDecimals &&
                    baseTokenSymbol
                ) {
                    setBaseToken({ 
                        name: baseTokenName,
                        symbol: baseTokenSymbol,
                        address: baseTokenAddress,
                        contract: new ethers.Contract(baseTokenAddress, erc20ContractAbi, signer || provider),
                        logoURI: "/custom-token-icon-light-theme.png"
                    });
                }
            } else {
                const baseTokenDefault = tokens[0];
                setBaseToken({
                    ...baseTokenDefault,
                    contract: new ethers.Contract(baseTokenDefault.address, erc20ContractAbi, signer || provider),
                });
            }
        }
    }, [router.query, tokens, provider]);

    const _setToken = (token, isCustomToken, type) => {
        if (isCustomToken) {
            router.push({ 
                query: { 
                    ...router.query,
                    [
                        type === "ASSET" 
                            ? "assetTokenName" 
                            : "baseTokenName"
                    ]: token.name,
                    [
                        type === "ASSET" 
                            ? "assetTokenAddress" 
                            : "baseTokenAddress"
                    ]: token.address,
                    [
                        type === "ASSET" 
                            ? "assetTokenDecimals" 
                            : "baseTokenDecimals"
                    ]: token.decimals,
                    [
                        type === "ASSET" 
                            ? "assetTokenSymbol" 
                            : "baseTokenSymbol"
                    ]: token.symbol,
                }
            });
        } else {
            router.push({ 
                query: { 
                    ...router.query,
                    [
                        type === "ASSET" 
                            ? "assetTokenName" 
                            : "baseTokenName"
                    ]: token.name, 
                }
            });
        }
    };

    const _setAssetToken = (token, isCustomToken) => _setToken(token, isCustomToken, "ASSET");
    const _setBaseToken = (token, isCustomToken) => _setToken(token, isCustomToken, "BASE");

    const [token0, token1] = useMemo(() => {
        if (assetToken && baseToken) {
            // Always make the imeb token the token1
            if (assetToken.address === IMEB_TOKEN.address)
                return [baseToken, assetToken];
            else if (baseToken.address === IMEB_TOKEN.address)
                return [assetToken, baseToken];
    
            // token0 should always be the smaller address (if it's not IMEB token)
            return assetToken.address < baseToken.address ? 
                [assetToken, baseToken] 
                : [baseToken, assetToken];
        }

        return [];
    }, [assetToken, baseToken]);

    return (
        <TokenPairContext.Provider 
            value={{ 
                imebToken: IMEB_TOKEN,
                assetToken, 
                baseToken, 
                token0,
                token1,
                tokens, 
                setAssetToken: _setAssetToken, 
                setBaseToken: _setBaseToken 
            }}
        >
            {children}
        </TokenPairContext.Provider>
    );
};