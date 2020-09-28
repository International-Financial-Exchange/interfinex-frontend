import Text from "../../core/Text";
import Link from "next/link";
import Button from "../../core/Button";
import Span from "../../core/Span";
import { PIXEL_SIZING, CONTAINER_SIZING, dropinAnimation } from "../../../utils";
import styled from "styled-components";
import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useContext, createRef, useLayoutEffect, useMemo } from "react";
import { EthersContext } from "../../../context/Ethers";
import { ethers } from "ethers";
import { Card } from "../../core/Card";
import Skeleton from "react-loading-skeleton";
import { Dropdown, DropdownItem } from "../Dropdown";
import { ModalCard } from "../../core/ModalCard";
import ReactDOM from "react-dom";
import { ContentAndArrow } from "../../core/ContentAndArrow";
import { ArrowDirection } from "../../core/ArrowDirection";
import { TokenPairContext } from "../../../context/TokenPair";
import InfiniteScroll from 'react-infinite-scroller';
import { SearchInput } from "../../core/SearchInput";
import { Modal } from "../Modal";
import { Input } from "../../core/Input";
import { InputAndLabel } from "../../core/InputAndLabel";
import { getDisplayName } from "next/dist/next-server/lib/utils";
import _ from "lodash";

const TabOption = styled(Text)`
    padding: ${PIXEL_SIZING.small};
    border-radius: ${PIXEL_SIZING.small};
    width: fit-content;
    color: ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.textSecondary};
    font-weight: ${({ selected }) => selected ? "bold" : ""};
    transition: background-color 0.07s ease-out;
    user-select: none;

    &:hover {
        cursor: pointer;
        background-color: ${({ theme }) => theme.colors.highlight}
    }
`;

const TabUnderline = styled.div`
    position: absolute;
    background-color: ${({ theme }) => theme.colors.primary};
    height: ${PIXEL_SIZING.microscopic};
    border-radius: ${PIXEL_SIZING.microscopic};
    transition: width 0.1s ease-out, left 0.1s ease-out;
    position: absolute;
    bottom: 0;
`

const TabNav = ({ items, selected, onChange }) => {
    const [internalSelected, setInternalSelected] = useState(items[0].value);
    const [mounted, setMounted] = useState(false);
    const optionRefs = useRef({});

    const _selected = selected ?? internalSelected;

    // Use this so that we make sure the refs are populated;
    // Then we can accurately calculate the TabUnderline position.
    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", justifyItems: "center", columnGap: PIXEL_SIZING.large, position: "relative" }}>
            {
                items.map(({ label, value }) =>
                    <TabOption 
                        selected={value === _selected}
                        onClick={() => {
                            setInternalSelected(value);
                            onChange(value);
                        }}
                        ref={e => optionRefs.current[value] = e}
                    >
                        {label}
                    </TabOption>
                )
            }

            <TabUnderline
                style={{ 
                    width: optionRefs.current[_selected]?.offsetWidth,
                    left: optionRefs.current[_selected]?.offsetLeft,
                    bottom: -14,
                }}
            />
        </div>
    );
};

const AccountQuickInfoCard = styled(Card)`
    transition: all 0.1s ease-out;
    user-select: none;

    &:active {
        transform: scale(0.9);
    }

    &:hover {
        border: 1px solid ${({ theme }) => theme.colors.primary};
        cursor: pointer;
    }
`;

export const PairQuickInfoCard = styled(Card)`
    transition: all 0.1s ease-out;
    user-select: none;
    width: fit-content;
    display: grid; 
    grid-template-columns: 1fr auto; 
    align-items: center; 
    column-gap: ${PIXEL_SIZING.microscopic};
    position: absolute;
    height: fit-content;

    &:active {
        transform: scale(0.9);
    }

    &:hover {
        border: 1px solid ${({ theme }) => theme.colors.primary};
        column-gap: ${PIXEL_SIZING.tiny};
        cursor: pointer;
    }
`;

const PairSelectContainer = styled(ModalCard)`    
    box-shadow: ${({ theme }) => theme.colors.primaryBoxShadow};
    animation: ${dropinAnimation} 0.05s ease-out forwards;
`;

const TokenSelectItem = styled.div`
    &:hover {
        background-color: ${({ theme }) => theme.colors.highlight};
    }
`;

const AddCustomToken = ({ onSubmit: propsOnSubmit = _.noop, isOpen, titleText, onClose }) => {
    const [contractAddress, setContractAddress] = useState("");
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [decimals, setDecimals] = useState(18);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const onSubmit = () => {
        setIsSubmitted(true);
        const validations = {
            name: name,
            symbol: symbol && symbol.length < 8,
            decimals: Number.isInteger(parseInt(decimals)),
            contractAddress: ethers.utils.isAddress(contractAddress),
        };

        if (_.values(validations).every(v => v))
            propsOnSubmit({
                address: contractAddress,
                decimals,
                name,
                symbol,
                logoURI: "/custom-token-icon-light-theme.png",
            });
    }; 

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {
                closeModal => 
                    <ModalCard>
                        <div style={{ padding: PIXEL_SIZING.medium, display: "grid", gridTemplateColumns: "1fr auto auto", columnGap: PIXEL_SIZING.medium, rowGap: PIXEL_SIZING.medium }}>
                            <Text primary style={{ gridColumn: "1/4" }}>                        
                                {titleText}
                            </Text>

                            <InputAndLabel style={{ gridColumn: "1/4" }}>
                                <Text secondary>Contract Address</Text>
                                <Input
                                    isError={isSubmitted && !ethers.utils.isAddress(contractAddress)}
                                    onChange={e => setContractAddress(e.target.value)}
                                    value={contractAddress}
                                    placeholder={"0x0123456..."}
                                />
                            </InputAndLabel>

                            <InputAndLabel>
                                <Text secondary>Name</Text>
                                <Input
                                    isError={isSubmitted && !name}
                                    onChange={e => setName(e.target.value)}
                                    value={name}
                                    placeholder={"e.g. Chainlink"}
                                />
                            </InputAndLabel>

                            <InputAndLabel>
                                <Text secondary>Symbol</Text>
                                <Input
                                    isError={isSubmitted && (!symbol || symbol.length >= 8)}
                                    onChange={e => setSymbol(e.target.value)}
                                    style={{ width: CONTAINER_SIZING.tiny }}
                                    value={symbol}
                                    placeholder={"e.g. ETH"}
                                />
                            </InputAndLabel>

                            <InputAndLabel>
                                <Text secondary>Decimals</Text>
                                <Input                                                    
                                    type={"number"}
                                    isError={isSubmitted && !Number.isInteger(parseInt(decimals))}
                                    style={{ width: CONTAINER_SIZING.tiny }}
                                    value={decimals}
                                    onChange={e => setDecimals(e.target.value)}
                                    placeholder={"e.g. 18"}
                                />
                            </InputAndLabel>

                            <Button style={{ width: CONTAINER_SIZING.tiny, }} onClick={onSubmit}>
                                Add Token
                            </Button>
                        </div>
                    </ModalCard>
            }
        </Modal>
    );
};

export const TokenSelectMenu = ({ onChange, type, onClose }) => {
    const { tokens } = useContext(TokenPairContext);
    const [tokensToRender, setTokensToRender] = useState(tokens.slice(0,20));
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddCustomToken, setShowAddCustomToken] = useState(false);

    const filteredTokens = useMemo(() => {
        return tokensToRender.filter(({ name, address }) => !searchTerm || name.toLowerCase().includes(searchTerm) || address.toLowerCase().includes(searchTerm));
    }, [searchTerm, tokensToRender]);

    return (
        <div style={{ position: "relative", padding: PIXEL_SIZING.small }}>
            <div style={{ overflow: "auto", display: "grid", width: "100%", maxWidth: CONTAINER_SIZING.medium, position: "relative" }}>
                <ArrowDirection 
                    onClick={onClose}
                    style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0,
                    }}
                />

                <div style={{ padding: PIXEL_SIZING.small, display: "grid", rowGap: PIXEL_SIZING.medium }}>
                    <Text primary style={{ textAlign: "center", }}>
                        {type === "ASSET" ? "Asset" : "Base"} Token
                    </Text>

                    <div style={{ textAlign: "center", display: "grid", gridTemplateColumns: "1fr auto", columnGap: PIXEL_SIZING.medium, alignItems: "center" }}>
                        <SearchInput
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value?.toLowerCase())}
                            placeholder={"Search"}
                        />

                        <Button 
                            secondary 
                            style={{ height: "fit-content", }}
                            onClick={() => setShowAddCustomToken(true)}
                        >
                            Add Token
                        </Button>

                        <AddCustomToken
                            titleText={`Add Custom ${type === "ASSET" ? "Asset" : "Base"} Token`}
                            onSubmit={customToken => {
                                onChange(customToken, true);
                                onClose();
                            }}
                            isOpen={showAddCustomToken}
                            onClose={() => setShowAddCustomToken(false)}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, marginBottom: PIXEL_SIZING.small, height: CONTAINER_SIZING.medium, overflow: "auto" }}>
                    <InfiniteScroll
                        loadMore={() => setTokensToRender(old => old.concat(tokens.slice(old.length, old.length + 20)))}
                        hasMore={tokensToRender.length !== tokens.length}
                        useWindow={false}
                    >
                        {
                            filteredTokens.map(({ name, logoURI, address, ...args }) =>
                                <ContentAndArrow 
                                    key={address}
                                    onClick={() => {
                                        onChange({ name, logoURI, address, ...args });
                                        onClose();
                                    }}
                                    style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", }}
                                >
                                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.small, alignItems: "center" }}>
                                        <img
                                            loading="lazy"
                                            style={{ height: PIXEL_SIZING.medium }}
                                            src={logoURI}
                                        />
                                        <Text primary style={{ textOverflow: "ellipsis", width: "70%", overflow: "hidden" }}>
                                            {name}
                                        </Text>
                                    </div>
                                </ContentAndArrow>
                            )
                        }
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    );
};

const PairSelect = () => {
    const [showSelect, setShowSelect] = useState();
    const [showTokenSelectMenu, setShowTokenSelectMenu] = useState();
    const [tokenSelectType, setTokenSelectType] = useState();
    const selectContainer = useRef({});
    const { assetToken, baseToken, setAssetToken, setBaseToken } = useContext(TokenPairContext);
    const router = useRouter();

    return (
        <>
            <PairQuickInfoCard padding onClick={() => setShowSelect(true)}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", columnGap: PIXEL_SIZING.tiny, alignItems: "center" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.miniscule, alignItems: "center" }}>
                        <img
                            loading="lazy"
                            style={{ height: PIXEL_SIZING.small }}
                            src={assetToken?.logoURI}
                        />
                        <Text style={{ textOverflow: "ellipsis", width: "fit-content", maxWidth: PIXEL_SIZING.larger, overflow: "hidden" }}>
                            {assetToken?.symbol}
                        </Text>
                    </div>

                    <Text secondary>/</Text>

                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.miniscule, alignItems: "center" }}>
                        <img
                            loading="lazy"
                            style={{ height: PIXEL_SIZING.small }}
                            src={baseToken?.logoURI}
                        />
                        <Text style={{ textOverflow: "ellipsis", width: "fit-content", maxWidth: PIXEL_SIZING.larger, overflow: "hidden" }}>
                            {baseToken?.symbol}
                        </Text>
                    </div>
                </div>

                <img
                    style={{ height: PIXEL_SIZING.medium, transform: "rotate(270deg)" }}
                    src={"/expand-arrow-light-theme.png"}
                />
            </PairQuickInfoCard>

            <div style={{ position: "fixed", top: -13, left: 0 }} ref={selectContainer}>
                {
                    showSelect &&
                        <Dropdown 
                            right 
                            parentRef={selectContainer} 
                            onClose={() => {
                                setShowSelect(false);
                                setShowTokenSelectMenu(false);
                                setTokenSelectType();
                            }}
                        >
                            {
                                showTokenSelectMenu && tokenSelectType 
                                    ? <TokenSelectMenu 
                                        type={tokenSelectType} 
                                        onChange={(selectedToken, isCustomToken) => {
                                            if (tokenSelectType === "ASSET") setAssetToken(selectedToken, isCustomToken);
                                            else setBaseToken(selectedToken, isCustomToken);
                                        }}
                                        onClose={() => {
                                            setTokenSelectType();
                                            setShowTokenSelectMenu(false);
                                        }}
                                    />
                                    : <div style={{ padding: PIXEL_SIZING.larger, display: "grid", rowGap: PIXEL_SIZING.large }}>
                                        <Text primary style={{ textAlign: "center" }}>Select Trading Pair</Text>

                                        <div>
                                            <Text secondary>Asset Token</Text>
                                            <ContentAndArrow 
                                                style={{ marginTop: PIXEL_SIZING.tiny, marginLeft: '-' + PIXEL_SIZING.small, marginRight: '-' + PIXEL_SIZING.small }}
                                                onClick={() => {
                                                    setShowTokenSelectMenu(true);
                                                    setTokenSelectType("ASSET");
                                                }}
                                            >
                                                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.small }}>
                                                    <img
                                                        style={{ height: PIXEL_SIZING.large }}
                                                        src={assetToken?.logoURI}
                                                    />
                                                    <Text primary>{assetToken?.name}</Text>
                                                </div>
                                            </ContentAndArrow>
                                        </div>

                                        <div>
                                            <Text secondary>Base Token</Text>
                                            <ContentAndArrow 
                                                style={{ marginTop: PIXEL_SIZING.tiny, marginLeft: '-' + PIXEL_SIZING.small, marginRight: '-' + PIXEL_SIZING.small }}
                                                onClick={() => {
                                                    setShowTokenSelectMenu(true);
                                                    setTokenSelectType("BASE");
                                                }}
                                            >
                                                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.small }}>
                                                    <img
                                                        style={{ height: PIXEL_SIZING.large }}
                                                        src={baseToken?.logoURI}
                                                    />
                                                    <Text primary>{baseToken?.name}</Text>
                                                </div>
                                            </ContentAndArrow>
                                        </div>
                                    </div>
                            }
                        </Dropdown>
                }
            </div>
        </>
    );
};

export const AppNavBar = props => {
    const router = useRouter();
    const { provider, signer, setProvider, setSigner } = useContext(EthersContext);
    const [signerAddress, setSignerAddress] = useState();
    const [signerTokenBalance, setSignerTokenBalance] = useState();
    const [showAccountDropdown, setShowAccountDropdown] = useState();
    const accountContainerRef = useRef();

    useEffect(() => {
        if (signer) {
            signer.getAddress().then(address => setSignerAddress(address));
            signer.getBalance().then(balance => setSignerTokenBalance(balance))
        }
    }, [signer]);

    console.log(router);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", alignItems: "center", position: "relative" }}>
            <PairSelect/>

            <div style={{ justifySelf: "center", }}>
                <TabNav
                    selected={router.pathname.split("/app/")[1]}
                    onChange={selected => router.push(`/app/${selected}`)}
                    items={[
                        { label: "Dashboard", value: "dashboard" }, 
                        { label: "Swap", value: "swap" }, 
                        { label: "Options", value: "options" },
                    ]}
                />
            </div>

            <div style={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)", }}>
                {
                    signer ?
                        <div 
                            ref={accountContainerRef} 
                            onClick={() => setShowAccountDropdown(true)}
                            style={{ display: "grid", gridTemplateColumns: "auto 1fr", width: "fit-content", columnGap: PIXEL_SIZING.small }}
                        >
                            <AccountQuickInfoCard padding>
                                <Text style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {ethers.utils.formatEther(signerTokenBalance || 0)} ETH
                                </Text>
                            </AccountQuickInfoCard>
                            <AccountQuickInfoCard padding>
                                <Text style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1 }}>
                                    {
                                        signerAddress ?
                                            `${signerAddress.slice(0,5)}...${signerAddress.slice(signerAddress.length - 5)}`
                                            : <Skeleton width={CONTAINER_SIZING.small}/>
                                    }
                                </Text>
                            </AccountQuickInfoCard>

                            {
                                showAccountDropdown &&
                                    <Dropdown left parentRef={accountContainerRef} onClose={() => setShowAccountDropdown(false)}>
                                        <div style={{ padding: PIXEL_SIZING.medium, display: "grid", }}>
                                            {
                                                [
                                                    { label: "Switch Account", onClick: () => router.push("/app/wallet-connect")},
                                                    { 
                                                        label: "Disconnect Wallet", 
                                                        onClick: () => {
                                                            setProvider(null);
                                                            setSigner(null);
                                                        }
                                                }
                                                ].map(({ label, onClick }) =>
                                                    <DropdownItem onClick={onClick}>
                                                        <Text>
                                                            {label}
                                                        </Text>
                                                    </DropdownItem>
                                                )
                                            }
                                        </div>
                                    </Dropdown>
                            }
                        </div>
                        : <Link href={"/app/wallet-connect"}>
                            <Button>
                                Connect Wallet
                            </Button>
                        </Link>
                }
            </div>
        </div>
    );
};