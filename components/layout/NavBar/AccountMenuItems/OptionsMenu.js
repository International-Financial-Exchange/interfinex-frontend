import { Triangle } from "../../../core/Triangle";
import { DropdownIconContainer } from "./AccountMenuItems";
import styled from "styled-components";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { ModalCard } from "../../../core/ModalCard";
import { DropdownTransitioner, SelectableDropdownItem } from "../../DropdownTransitioner";
import { useContext, useState } from "react";
import { Modal } from "../../Modal";
import { EthersContext } from "../../../../context/Ethers";
import { AccountContext } from "../../../../context/Account";
import { AccountAddress } from "./AccountAddress";
import { AccountEthBalance } from "./AccountEthBalance";

export const OptionsMenu = () => {
    const [showDropDown, setShowDropDown] = useState(false);

    return (
        <>
            <DropdownIconContainer onClick={() => setShowDropDown(!showDropDown)} selected={showDropDown}>
                <Triangle
                    style={{ transform: "rotate(180deg)", height: 18, marginTop: "1%", }} 
                    className={"options-menu-icon"}
                />
            </DropdownIconContainer>

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


const ExpandedOptionsMenuContainer = styled.div`
    display: grid;
    row-gap: ${PIXEL_SIZING.small};

    @media (min-width: 900px) {
        #account-eth-balance-menu {
            display: none;
        }
    }
`;

const ExpandedOptionsMenu = () => {
    const { setSigner } = useContext(EthersContext);
    const { address } = useContext(AccountContext);

    return (
        <ExpandedOptionsMenuContainer>
            <AccountAddress primary/>
            <AccountEthBalance id={"account-eth-balance-menu"}/>

            <SelectableDropdownItem 
                Icon={<LogoutIcon className={"dropdown-transition-icon"}/>}
                onClick={() => {
                    setSigner();
                }}
            >
                Disconnect Wallet
            </SelectableDropdownItem>
        </ExpandedOptionsMenuContainer>
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
};