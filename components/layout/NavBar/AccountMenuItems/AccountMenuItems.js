import { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import styled, { ThemeContext } from "styled-components";
import { AccountContext } from "../../../../context/Account";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext, NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from "../../../../context/Notifications";
import { THEME_OPTIONS } from "../../../../context/Theme";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Avatar } from "../../../core/Avatar";
import { FailCrossIcon } from "../../../core/FailCrossIcon";
import { LinkIcon } from "../../../core/LinkIcon";
import { ModalCard } from "../../../core/ModalCard";
import { BarSpinner, CircleSpinner } from "../../../core/Spinner";
import { SuccessTickIcon } from "../../../core/SuccesTickIcon";
import Text from "../../../core/Text";
import { Triangle } from "../../../core/Triangle";
import { DropdownItem } from "../../Dropdown";
import { DropdownTransitioner, SelectableDropdownItem } from "../../DropdownTransitioner";
import { Modal } from "../../Modal";
import { AccountAddress } from "./AccountAddress";
import { AccountEthBalance } from "./AccountEthBalance";
import { NotificationsPreview } from "./NotificationsPreview";
import { OptionsMenu } from "./OptionsMenu";
import { ThemeToggle } from "./ThemeToggle";

const Container = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 900px) {
        #account-eth-balance {
            display: none;
        }
    }

    @media (max-width: 1100px) {
        #nav-account-address {
            display: none;
        }
    }
`;

export const DropdownIconContainer = styled.div`
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

export const AccountMenuItems = () => {
    return (
        <Container>
            <AccountEthBalance id={"account-eth-balance"}/>
            <AccountAddress style={{ marginRight: PIXEL_SIZING.small }}/>
            <ThemeToggle/>
            <NotificationsPreview/>
            <OptionsMenu/>
        </Container>
    );
};