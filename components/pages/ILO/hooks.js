import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../context/Account";
import { humanizeTokenAmount } from "../../../utils/utils";
import { getIloDepositHistory, getIloItem } from "./networkRequests";

export const useIlo = ({ contractAddress, iloJson }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [ilo, setIlo] = useState();

    useEffect(() => {
        if (iloJson) {
            setIlo(JSON.parse(iloJson));
            setIsLoading(false);
        } else {
            if (contractAddress) {
                getIloItem({ contractAddress })
                    .then(ilo => {
                        setIlo(ilo);
                        setIsLoading(false);
                    });
            }
        }
    }, [contractAddress]);

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

export const useIloDepositHistory = ({ contractAddress, user }) => {
    const [depositHistory, setDepositHistory] = useState([]);
    const [gotAllDepositHistory, setGotAllDepositHistory] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getMoreDepositHistory = async () => {
        if (isLoading || !contractAddress) return;
        setIsLoading(true);

        console.log("contract address", contractAddress);
        const newDeposits = await getIloDepositHistory({ contractAddress, offset: depositHistory.length, user });
        console.log("new", newDeposits);

        setGotAllDepositHistory(newDeposits.length === 0);
        setDepositHistory(existing => existing.concat(newDeposits));
        setIsLoading(false);
    };

    return [depositHistory, isLoading, getMoreDepositHistory, gotAllDepositHistory];
};