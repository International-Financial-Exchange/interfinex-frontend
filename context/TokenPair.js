import { useRouter } from "next/router";

const { createContext, useState, useEffect, useContext } = require("react");
import { tokens as InchTokens } from "../public/1InchTokenList.json";
import { tokens as LocalTokens } from "../public/local-net/local-tokens.json";
import { IMEB_TOKEN } from "../utils";
import { EthersContext } from "./Ethers";
export const TokenPairContext = createContext();

export const TokenPairProvider = ({ children }) => {
    const router = useRouter();
    const [tokens, setTokens] = useState([IMEB_TOKEN].concat(InchTokens));
    const [assetToken, setAssetToken] = useState(tokens.find(({ name }) => name === "WrappedEther"));
    const [baseToken, setBaseToken] = useState(tokens.find(({ name }) => name === "TetherUSD"));
    const { networkInfo } = useContext(EthersContext);

    useEffect(() => {
        if (networkInfo) {
            if (networkInfo.chainId === 1)
                setTokens([IMEB_TOKEN].concat(InchTokens))
            else
                setTokens([IMEB_TOKEN].concat(LocalTokens));
        }
    }, [networkInfo])

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

        if (assetTokenName) {
            const assetToken = tokens.find(({ name }) => name === assetTokenName);
            if (assetToken) {
                setAssetToken(assetToken);
            } else if (
                assetTokenAddress && 
                assetTokenDecimals &&
                assetTokenSymbol
            ) {
                setAssetToken({ 
                    name: assetTokenName,
                    symbol: assetTokenSymbol,
                    address: assetTokenAddress,
                    logoURI: "/custom-token-icon-light-theme.png"
                });
            }
        }

        if (baseTokenName) {
            const baseToken = tokens.find(({ name }) => name === baseTokenName);
            if (baseToken) {
                setBaseToken(baseToken);
            } else if (
                baseTokenAddress && 
                baseTokenDecimals &&
                baseTokenSymbol
            ) {
                setBaseToken({ 
                    name: baseTokenName,
                    symbol: baseTokenSymbol,
                    address: baseTokenAddress,
                    logoURI: "/custom-token-icon-light-theme.png"
                });
            }
        }
    }, [router.query]);

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

    return (
        <TokenPairContext.Provider 
            value={{ 
                assetToken, 
                baseToken, 
                token0: assetToken.address > baseToken.address ? assetToken : baseToken,
                token1: assetToken.address > baseToken.address ? baseToken : assetToken,
                tokens, 
                setAssetToken: _setAssetToken, 
                setBaseToken: _setBaseToken 
            }}
        >
            {children}
        </TokenPairContext.Provider>
    );
};