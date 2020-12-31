import { useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { AccountContext } from "../../../context/Account";
import { EthersContext } from "../../../context/Ethers";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../utils/constants";
import { Avatar } from "../../core/Avatar";
import { ModalCard } from "../../core/ModalCard";
import { Triangle } from "../../core/Triangle";
import { DropdownTransitioner, SelectableDropdownItem } from "../DropdownTransitioner";
import { Modal } from "../Modal";

const Container = styled.div`
    display: flex;
`;

export const AccountMenuItems = () => {
    return (
        <Container>
            <AccountEthBalance/>
            <AccountAddress/>
            <OptionsMenu/>
        </Container>
    );
};

const AccountEthBalance = () => {
    const { ethBalance } = useContext(AccountContext);
    const theme = useContext(ThemeContext);

    return (
        <div 
            style={{ 
                border: `1px solid ${theme.colors.highlight}`, 
                padding: PIXEL_SIZING.small, 
                marginRight: PIXEL_SIZING.small,
                borderRadius: PIXEL_SIZING.tiny 
            }}
        >
            {ethBalance.toFixed(4)} ETH
        </div>
    );
};

const AccountAddressContainer = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    height: fit-content;
    border-radius: ${PIXEL_SIZING.tiny} 20px 20px ${PIXEL_SIZING.tiny};
    display: flex;
    padding-left: ${PIXEL_SIZING.small};
    align-items: center;
    position: relative;
    margin-right: ${PIXEL_SIZING.small};
    user-select: none;
`;

const AccountAddress = () => {
    const { address } = useContext(AccountContext);

    return (
        <AccountAddressContainer>
            <div style={{ marginRight: PIXEL_SIZING.tiny }}>
                {address?.slice(0,4)}...{address?.slice(address.length - 4)}
            </div>
            <Avatar style={{ height: 42, width: 42 }}/>
        </AccountAddressContainer>
    );
};

const OptionsMenuContainer = styled.div`
    height: 42px;
    width: 42px;
    background-color: ${({ theme}) => theme.colors.highlight};
    border-radius: 100px;
    display: grid;
    justify-items: center;
    align-items: center;
    border: 1px solid ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.highlight};

    transition: all 0.07s ease-out;

    &:active {
        transform: scale(0.95);
    }

    &:hover {
        cursor: pointer;
        border: 1px solid ${({ theme }) => theme.colors.textPrimary};

        .options-menu-triangle {
            path {
                fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary} !important;
            }
        }
    }

    .options-menu-triangle {
        path {
            fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textSecondary} !important;
        }
    }
`;

const OptionsMenu = () => {
    const [showDropDown, setShowDropDown] = useState(false);

    return (
        <>
            <OptionsMenuContainer onClick={() => setShowDropDown(!showDropDown)} selected={showDropDown}>
                <Triangle 
                    style={{ transform: "rotate(180deg)", height: 18, marginTop: "1%", }} 
                    className={"options-menu-triangle"}
                />
            </OptionsMenuContainer>

            <Modal 
                isOpen={showDropDown}
                topRight
                onClose={() => setShowDropDown(false)}
                showBackdrop={false}
            >
                <ModalCard style={{ width: CONTAINER_SIZING.small, padding: PIXEL_SIZING.small }}>
                    <DropdownTransitioner>
                        <ExpandedOptionsMenu/>
                    </DropdownTransitioner>
                </ModalCard>
            </Modal>
        </>
    );
};

const LogoutIcon = ({ className }) => {
    return (
        <svg 
            height={PIXEL_SIZING.medium} 
            width={PIXEL_SIZING.medium} 
            viewBox="0 0 512 512" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g id="Solid">
                <path 
                    d="m480.971 239.029-90.51-90.509a24 24 0 0 0 -33.942 0 24 24 0 0 0 0 33.941l49.54 49.539h-262.059a24 24 0 0 0 -24 24 24 24 0 0 0 24 24h262.059l-49.54 49.539a24 24 0 0 0 33.942 33.941l90.51-90.51a24 24 0 0 0 0-33.941z"/><path d="m304 392a24 24 0 0 0 -24 24v24h-208v-368h208v24a24 24 0 0 0 48 0v-32a40 40 0 0 0 -40-40h-224a40 40 0 0 0 -40 40v384a40 40 0 0 0 40 40h224a40 40 0 0 0 40-40v-32a24 24 0 0 0 -24-24z"
                />
            </g>
        </svg>
    );
}

const ExpandedOptionsMenu = () => {
    const { setSigner } = useContext(EthersContext);

    return (
        <SelectableDropdownItem 
            Icon={<LogoutIcon className={"dropdown-transition-icon"}/>}
            onClick={() => {
                console.log("hello there")
                setSigner();
            }}
        >
            Disconnect Wallet
        </SelectableDropdownItem>
    );
};

{/* <AccountQuickInfoCard padding>
<Text style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
    {tokenAmountToBig(signerTokenBalance || 0, { decimals: 18 }).toFixed(4)} ETH
</Text>
</AccountQuickInfoCard>

<Avatar/>

<AccountQuickInfoCard padding>
<Text style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1 }}>
    {
        signerAddress ?
            `${signerAddress.slice(0,5)}...${signerAddress.slice(signerAddress.length - 5)}`
            : <Skeleton width={CONTAINER_SIZING.small}/>
    }
</Text>
</AccountQuickInfoCard> */}