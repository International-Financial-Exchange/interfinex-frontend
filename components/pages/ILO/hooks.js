import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../../../context/Account";
import { humanizeTokenAmount, tokenAmountToBig } from "../../../utils/utils";
import { getIloDepositHistory, getIloItem, getIloList, getUserIlos } from "./networkRequests";

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

export const useIloList = ({ limit, sortType }) => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [gotAllItems, setGotAllItems] = useState(false);

    const getMoreItems = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const newItems = await getIloList({ 
            limit, 
            sortType, 
            offset: list.length,
        });

        setGotAllItems(newItems.length === 0);

        // Remove the duplicates
        setList(existing => {
            if (newItems.every(({ txId }) => !existing.some(({ txId: _txId }) => txId === txId))) {
                return existing.concat(newItems);
            };

            return existing;
        });

        setIsLoading(false);
    };

    useEffect(() => {
        getMoreItems();
    }, []);

    return { list, isLoading, getMoreItems, gotAllItems };
};

export const useMyIlos = ({ limit, user }) => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [gotAllItems, setGotAllItems] = useState(false);

    const getMoreItems = async () => {
        if (isLoading || !user) return;
        setIsLoading(true);

        const newItems = await getUserIlos({ 
            limit, 
            user, 
            offset: list.length,
        });

        setGotAllItems(newItems.length === 0);

        // Remove the duplicates
        setList(existing => {
            if (newItems.every(({ txId }) => !existing.some(({ txId: _txId }) => txId === txId))) {
                return existing.concat(newItems);
            };

            return existing;
        });

        setIsLoading(false);
    };

    useEffect(() => {
        setList([]);
        getMoreItems();
    }, [user]);

    return { list, isLoading, getMoreItems, gotAllItems };
};

export const useYourIloInvestment = ({ ILOContract, assetToken }) => {
    const { address } = useContext(AccountContext);
    const [accountEthInvested, setAccountEthInvested] = useState();
    const [accountTokensBought, setAccountTokensBought] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const updateInfo = async () => {
        setIsLoading(true);

        await Promise.all([
            ILOContract.etherDeposited(address, { gasLimit: 1_000_000 }),
            ILOContract.balanceOf(address, { gasLimit: 1_000_000 }),
        ]).then(([etherDeposited, tokensBought]) => {
            setAccountEthInvested(tokenAmountToBig(etherDeposited, { decimals: 18 }));
            setAccountTokensBought(tokenAmountToBig(tokensBought, assetToken));
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
        const newDeposits = await getIloDepositHistory({ contractAddress, offset: depositHistory.length, user });
        setGotAllDepositHistory(newDeposits.length === 0);
        setDepositHistory(existing => existing.concat(newDeposits));
        setIsLoading(false);
    };

    return [depositHistory, isLoading, getMoreDepositHistory, gotAllDepositHistory];
};