import { useContext, useEffect, useState } from "react";
import { EthersContext } from "../../../context/Ethers";
import { TokenPairContext } from "../../../context/TokenPair";
import { divOrZero, humanizeTokenAmount, isZeroAddress, tokenAmountToBig } from "../../../utils/utils";
import { getYieldFarms } from "./networkRequests";

export const useYieldFarmInfo = (liquidityToken, SwapContext) => {
    const { contracts: { YieldFarm }} = useContext(EthersContext);
    const { exchangeAssetTokenBalance, exchangeBaseTokenBalance, isExchangeInfoLoading } = useContext(SwapContext);
    const { assetToken, baseToken, ifexToken } = useContext(TokenPairContext);
    const [farmInfo, setFarmInfo] = useState();
    const [isLoading, setIsLoading] = useState();

    const updateFarmInfo = async () => {
        setIsLoading(true);
        if (liquidityToken) {
            const ifexBalance = assetToken.address === ifexToken.address ? exchangeAssetTokenBalance : exchangeBaseTokenBalance;

            const rawFarmInfo = await YieldFarm.tokenToFarmInfo(liquidityToken.address);
            const yieldPerBlock = tokenAmountToBig(rawFarmInfo.yieldPerBlock, { decimals: 18 });
            const annualYield = yieldPerBlock.mul(2336000);
            const annualAPR = divOrZero(annualYield, ifexBalance).mul(100);
            const farmInfo = {
                lastBlockUpdate: rawFarmInfo.lastBlockUpdate.toString(),
                tokenContract: rawFarmInfo.tokenContract,
                yieldPerBlock,
                annualYield,
                annualAPR
            };

            setFarmInfo(isZeroAddress(farmInfo.tokenContract) ? null : farmInfo);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!isExchangeInfoLoading) {
            updateFarmInfo();
        }
    }, [liquidityToken?.address, isExchangeInfoLoading]);

    return [farmInfo, isLoading]
};

export const useYieldFarms = () => {
    const [isLoading, setIsLoading] = useState();
    const [farms, setFarms] = useState();

    useEffect(() => {
        setIsLoading(true);
        getYieldFarms({ limit: 500 }).then(rawFarms => {
            const farms = rawFarms.map(({ 
                liquidityTokenContract: tokenContract, 
                yieldPerBlock,
                token0Address,
                token1Address,
                marketContract
            }) => ({ 
                tokenContract,
                yieldPerBlock: tokenAmountToBig(yieldPerBlock, { decimals: 18 }),
                annualYield: tokenAmountToBig(yieldPerBlock, { decimals: 18 }) * 2336000,
                token0Address,
                token1Address,
                marketContract,
            }));

            setFarms(farms);
            setIsLoading(false);
        });
    }, []);

    return [farms, isLoading];
};