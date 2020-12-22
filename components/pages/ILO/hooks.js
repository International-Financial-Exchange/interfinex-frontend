import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../context/Account";
import { humanizeTokenAmount } from "../../../utils/utils";
import { getIloItem } from "./networkRequests";

export const useIlo = ({ contractAddress, iloJson }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [ilo, setIlo] = useState();

    useEffect(() => {
        if (iloJson) {
            setIlo(JSON.parse(iloJson));
            setIsLoading(false);
        } else {
            getIloItem({ contractAddress })
                .then(ilo => {
                    setIlo(ilo);
                    setIsLoading(false);
                });
        }
    }, []);

    return [ilo, isLoading];
};

export const useYourIloInvestment = ({ ILOContract, assetToken }) => {
    const { address } = useContext(AccountContext);
    const [accountEthInvested, setAccountEthInvested] = useState();
    const [accountTokensBought, setAccountTokensBought] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const updateInfo = async () => {
        setIsLoading(true);
        await Promise.all([
            ILOContract.etherDeposited(address),
            ILOContract.balanceOf(address)
        ]).then(([etherDeposited, tokensBought]) => {
            console.log("invested", etherDeposited, tokensBought)
            setAccountEthInvested(humanizeTokenAmount(etherDeposited, { decimals: 18 }));
            setAccountTokensBought(humanizeTokenAmount(tokensBought, assetToken));
            setIsLoading(false);
        });
    };

    useEffect(() => {
        if (ILOContract && address) {
            updateInfo();
        }
    }, [ILOContract, address]);

    return [accountEthInvested, accountTokensBought, isLoading];
};