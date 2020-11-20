import { useRouter } from "next/router";

const { createContext, useState, useEffect, useContext, useMemo } = require("react");
import { tokens as InchTokens } from "../public/1InchTokenList.json";
import { EthersContext } from "./Ethers";
import { ethers } from "ethers";
import { AccountContext } from "./Account";
import { getRequest } from "../utils";
export const TokenPairContext = createContext();


export const TokenPairProvider = ({ children }) => {
    const router = useRouter();
    const [tokens, setTokens] = useState();
    const { signer, networkInfo, provider, contracts: { getAbi, IfexToken, }, TestnetTokens } = useContext(EthersContext);

    const [assetToken, setAssetToken] = useState();
    const [baseToken, setBaseToken] = useState();

    const IFEX_TOKEN = useMemo(() => {
        return {
            address: IfexToken.address,
            decimals: 18,
            name: "Interfinex Bills",
            symbol: "IFEX",
            chainId: networkInfo?.chainId,
            contract: IfexToken,
            logoURI: "/logo.png"
        }
    }, [IfexToken, networkInfo?.chainId]);

    useEffect(() => {
        if (networkInfo) {
            if (networkInfo.chainId === 1) {
                fetch("https://t2crtokens.eth.link/")
                    .then(res => res.json())
                    .then(({ tokens }) => {
                        const newTokens = tokens.map(token => {
                            token.logoURI = `https://ipfs.kleros.io/ipfs/${token.logoURI.split("ipfs://").last()}`;
                            return token;
                        });
                        setTokens([IFEX_TOKEN].concat(newTokens));
                    });
            } else {
                const tokens = [IFEX_TOKEN].concat(TestnetTokens);
                setTokens(tokens);
            }
        }
    }, [networkInfo?.chainId, IfexToken]);

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
                    setAssetToken({
                        ...assetToken,
                        contract: new ethers.Contract(assetToken.address, getAbi("ERC20"), signer || provider),
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
                        contract: new ethers.Contract(assetTokenAddress, getAbi("ERC20"), signer || provider),
                        logoURI: "/custom-token-icon-light-theme.png"
                    });
                }
            } else {
                const assetTokenDefault = IFEX_TOKEN;
                setAssetToken({
                    ...assetTokenDefault,
                    contract: new ethers.Contract(assetTokenDefault.address, getAbi("ERC20"), signer || provider),
                });
            }
    
            if (baseTokenName) {
                const baseToken = tokens.find(({ name }) => name === baseTokenName);
                if (baseToken) {
                    setBaseToken({
                        ...baseToken,
                        contract: new ethers.Contract(baseToken.address, getAbi("ERC20"), signer || provider),
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
                        contract: new ethers.Contract(baseTokenAddress, getAbi("ERC20"), signer || provider),
                        logoURI: "/custom-token-icon-light-theme.png"
                    });
                }
            } else {
                const baseTokenDefault = tokens.find(({ name }) => name === "Tether") || tokens[1];
                setBaseToken({
                    ...baseTokenDefault,
                    contract: new ethers.Contract(baseTokenDefault.address, getAbi("ERC20"), signer || provider),
                });
            }
        }
    }, [router.query, tokens, provider]);

    const _setToken = (token, isCustomToken, type) => {
        const keyPrefix = type === "ASSET" ? "assetToken" : "baseToken";

        if (isCustomToken) {
            router.push({ 
                query: { 
                    ...router.query,
                    [`${keyPrefix}Name`]: token.name,
                    [`${keyPrefix}Address`]: token.address,
                    [`${keyPrefix}Decimals`]: token.decimals,
                    [`${keyPrefix}Symbol`]: token.symbol,
                }
            });
        } else {
            router.push({ 
                query: { 
                    ...router.query,
                    [`${keyPrefix}Name`]: token.name,
                }
            });
        }
    };

    const _setAssetToken = (token, isCustomToken) => _setToken(token, isCustomToken, "ASSET");
    const _setBaseToken = (token, isCustomToken) => _setToken(token, isCustomToken, "BASE");

    const [token0, token1] = useMemo(() => {
        if (assetToken && baseToken) {
            // token0 should always be the smaller address
            return assetToken.address < baseToken.address ? 
                [assetToken, baseToken] 
                : [baseToken, assetToken];
        }

        return [];
    }, [assetToken, baseToken]);

    return (
        <TokenPairContext.Provider 
            value={{ 
                ifexToken: IFEX_TOKEN,
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