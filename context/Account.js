import { createContext, useState, useEffect, useMemo, useContext, } from "react";
import { EthersContext } from "./Ethers";
import { TokenPairContext } from "./TokenPair";
import ethers from "ethers";
import { NotificationsContext, NOTIFICATION_TYPES } from "./Notifications";
import Text from "../components/core/Text";

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const { signer, provider, contracts: { erc20ContractAbi } } = useContext(EthersContext);
    const { baseToken, assetToken, ifexToken } = useContext(TokenPairContext);
    const { addLayoutNotification } = useContext(NotificationsContext);
    const [address, setAddress] = useState();
    const [baseTokenBalance, setBaseTokenBalance] = useState();
    const [assetTokenBalance, setAssetTokenBalance] = useState();
    const [ifexTokenBalance, setIfexTokenBalance] = useState();
    const [deleteWalletWarning, setDeleteWalletWarning] = useState();

    useEffect(() => {
        if (!signer) {
            const deleteWalletWarning = addLayoutNotification({
                content: "Connect your wallet to start trading",
                type: NOTIFICATION_TYPES.warn,
            });

            setDeleteWalletWarning(() => deleteWalletWarning)
        } else {
            if (deleteWalletWarning) deleteWalletWarning();
            // console.log(signer);
            signer?.getAddress().then(address => setAddress(address));
        }
    }, [signer]);

    useEffect(() => {
        if (address) {
            console.log(address);
            console.log(baseToken, assetToken, ifexToken)
            baseToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                console.log("base", baseToken)
                setBaseTokenBalance(ethers.utils.formatUnits(balance, baseToken.decmials))
            });

            assetToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                console.log("asset", assetToken)
                setAssetTokenBalance(ethers.utils.formatUnits(balance, assetToken.decmials))
            });

            ifexToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                console.log("ifex", ifexToken)
                setIfexTokenBalance(ethers.utils.formatUnits(balance, ifexToken.decmials))
            });
        }
    }, [provider, address, baseToken, assetToken, ifexToken]);

    return (
        <AccountContext.Provider 
            value={{ 
                baseTokenBalance,
                assetTokenBalance,
                ifexTokenBalance,
                address,
            }}
        >
            { children }
        </AccountContext.Provider>
    );
}
