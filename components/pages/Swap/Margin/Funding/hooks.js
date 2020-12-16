import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../../../context/Account";
import { EthersContext } from "../../../../../context/Ethers";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { humanizeTokenAmount } from "../../../../../utils/utils";

export const useFunding = ({ AssetTokenMarginMarket, BaseTokenMarginMarket, marginMarkets }) => {
    const { assetToken, baseToken } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const { contracts: { MarginFactory, createContract }} = useContext(EthersContext);
    const [stats, setStats] = useState({});
    const [liquidityToken, setLiquidityToken] = useState();
    const [account, setAccount] = useState();
    const [isLoading, setIsLoading] = useState();

    const updateStats = async () => {
        [
            [AssetTokenMarginMarket, assetToken], 
            [BaseTokenMarginMarket, baseToken]
        ].map(async ([MarginMarket, token]) => {
            const rawStats = await Promise.all([
                MarginMarket.totalBorrowed({ gasLimit: 1_000_000 }),
                MarginMarket.totalReserved({ gasLimit: 1_000_000 }),
                MarginMarket.interestRate({ gasLimit: 1_000_000 }),
            ])

            setStats(oldState => { 
                const newState = _.cloneDeep(oldState);
                newState[MarginMarket.address] = { 
                    totalBorrowed: humanizeTokenAmount(rawStats[0], token), 
                    totalReserved: humanizeTokenAmount(rawStats[1], token), 
                    totalValue: humanizeTokenAmount(rawStats[0], token) + humanizeTokenAmount(rawStats[1], token),
                    interestRate: humanizeTokenAmount(rawStats[2], { decimals: 18 }),
                };
                return newState;
            });
        }); 
    };

    const updateLiquidityTokens = async () => {
        const [assetLiquidityToken, baseLiquidityToken] = await Promise.all(
            [AssetTokenMarginMarket, BaseTokenMarginMarket]
                .map(async MarginMarket => 
                    createContract(await MarginMarket.liquidityToken({ gasLimit: 1_000_000 }), "DividendERC20")
                )
        );

        setLiquidityToken({
            [assetToken.address]: { 
                contract: assetLiquidityToken, 
                address: assetLiquidityToken.address,
                MarginMarket: AssetTokenMarginMarket,
                totalSupply: humanizeTokenAmount(await assetLiquidityToken.totalSupply({ gasLimit: 1_000_000 }), { decimals: 18 })
            },
            [baseToken.address]: { 
                contract: baseLiquidityToken, 
                address: baseLiquidityToken.address,
                MarginMarket: BaseTokenMarginMarket,
                totalSupply: humanizeTokenAmount(await baseLiquidityToken.totalSupply({ gasLimit: 1_000_000 }), { decimals: 18 })
            },
        });
    };

    const updateAccount = async () => {
        _.entries(liquidityToken).map(async ([assetTokenAddress, liquidityToken]) => {
            const liquidityTokenBalance = humanizeTokenAmount(await liquidityToken.contract.balanceOf(address, { gasLimit: 1_000_000 }), { decimals: 18 });
            const assetTokenDeposited = liquidityTokenBalance / liquidityToken.totalSupply * stats[liquidityToken.MarginMarket.address].totalValue;
            setAccount(oldState => {
                const newState = _.cloneDeep(oldState);
                newState[assetTokenAddress] = { 
                    liquidityTokenBalance, 
                    assetTokenDeposited: Number.isNaN(assetTokenDeposited) ? 0 : assetTokenDeposited,
                };
                return newState;
            });
        });
    };

    useEffect(() => {
        if (AssetTokenMarginMarket && BaseTokenMarginMarket) {
            setIsLoading(true);
            Promise.all([
                updateStats(),
                updateLiquidityTokens(),
            ]).then(() => setIsLoading(false))
        }
    }, [AssetTokenMarginMarket?.address, BaseTokenMarginMarket?.address]);

    useEffect(() => {
        if (liquidityToken && stats && address) {
            setAccount(old => ({ ...old, isLoading: true }));
            updateAccount().then(() => 
                setAccount(old => ({ ...old, isLoading: false }))
            );
        }
    }, [liquidityToken?.address, stats, address])

    return { stats, liquidityToken, account, isLoading };
};