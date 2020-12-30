import { createContext, useState, useEffect, useMemo, useContext, } from "react";
import { EthersContext } from "./Ethers";
import { TokenPairContext } from "./TokenPair";
import ethers from "ethers";
import { NotificationsContext, NOTIFICATION_TYPES } from "./Notifications";
import Text from "../components/core/Text";
import { humanizeTokenAmount, tokenAmountToBig } from "../utils/utils";
import { formatEther, formatUnits } from "ethers/lib/utils";
import Big from "big.js";

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const { signer, provider, contracts: { erc20ContractAbi } } = useContext(EthersContext);
    const { baseToken, assetToken, ifexToken } = useContext(TokenPairContext);
    const { addLayoutNotification } = useContext(NotificationsContext);
    const [address, setAddress] = useState();
    const [baseTokenBalance, setBaseTokenBalance] = useState(new Big(0));
    const [assetTokenBalance, setAssetTokenBalance] = useState(new Big(0));
    const [ifexTokenBalance, setIfexTokenBalance] = useState(new Big(0));
    const [ethBalance, setEthBalance] = useState(new Big(0));
    const [deleteWalletWarning, setDeleteWalletWarning] = useState();

    useEffect(() => {
        if (!signer) {
            const deleteWalletWarning = addLayoutNotification({
                content: "Connect your wallet to start trading",
                type: NOTIFICATION_TYPES.warn,
            });
            setAddress();
            setDeleteWalletWarning(() => deleteWalletWarning)
        } else {
            if (deleteWalletWarning) deleteWalletWarning();
            if (!address)  {
                signer.getAddress().then(address => {
                    setAddress(address)
                });
            }
        }
    }, [signer]);

    useEffect(() => {
        if (address && signer) {
            if (baseToken.name === "Ethereum") {
                signer.getBalance().then(balance => 
                    setBaseTokenBalance(tokenAmountToBig(balance, { decimals: 18 }))
                )
            } else {
                baseToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                    setBaseTokenBalance(tokenAmountToBig(balance, baseToken))
                });
            }

            if (assetToken.name === "Ethereum") {
                signer.getBalance().then(balance => 
                    setAssetTokenBalance(tokenAmountToBig(balance, { decimals: 18 }))
                )
            } else {
                assetToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                    setAssetTokenBalance(tokenAmountToBig(balance, assetToken))
                });
            }

            ifexToken.contract.balanceOf(address, { gasLimit: 1000000 }).then(balance => {
                setIfexTokenBalance(tokenAmountToBig(balance, ifexToken))
            });

            signer.getBalance().then(balance => 
                setEthBalance(tokenAmountToBig(balance, { decimals: 18 }))
            )
        }
    }, [provider, address, baseToken, assetToken, ifexToken]);

    console.log("ACCOUNT balance", assetTokenBalance);


    return (
        <AccountContext.Provider 
            value={{ 
                ethBalance,
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
