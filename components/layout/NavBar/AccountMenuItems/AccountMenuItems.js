import styled, { ThemeContext } from "styled-components";
import { PIXEL_SIZING } from "../../../../utils/constants";
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

// Circle icon in the top right when wallet is connected
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

        .options-menu-icon {
            path {
                fill: ${({ theme, selected }) => selected ? theme.colors.primary : theme.colors.textPrimary} !important;
            }
        }
    }

    .options-menu-icon {
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