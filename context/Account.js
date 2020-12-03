import { createContext, useState, useEffect, useMemo, useContext, } from "react";
import { EthersContext } from "./Ethers";
import { TokenPairContext } from "./TokenPair";
import ethers from "ethers";
import { NotificationsContext, NOTIFICATION_TYPES } from "./Notifications";
import Text from "../components/core/Text";
import { humanizeTokenAmount } from "../utils/utils";
import { formatEther } from "ethers/lib/utils";

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
            if (!address) signer.getAddress().then(address => {
                console.log("settings", address)
                setAddress(address)
            });
        }
    }, [signer]);

    useEffect(() => {
        if (address) {
            if (baseToken.name === "Ethereum") {
                signer.getBalance().then(balance => 
                    setBaseTokenBalance(parseFloat(formatEther(balance)))
                )
            } else {
                baseToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                    setBaseTokenBalance(humanizeTokenAmount(balance, baseToken))
                });
            }

            if (assetToken.name === "Ethereum") {
                signer.getBalance().then(balance => 
                    setAssetTokenBalance(parseFloat(formatEther(balance)))
                )
            } else {
                assetToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                    setAssetTokenBalance(humanizeTokenAmount(balance, assetToken))
                });
            }

            ifexToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                setIfexTokenBalance(humanizeTokenAmount(balance, ifexToken))
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
