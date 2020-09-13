import Text from "../../core/Text";
import Link from "next/link";
import Button from "../../core/Button";
import Span from "../../core/Span";
import { PIXEL_SIZING } from "../../../utils";
import styled from "styled-components";
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from "react";

const TabOption = styled(Text)`
    padding: ${PIXEL_SIZING.medium};
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
    const optionRefs = useRef({});

    useEffect(() => {
        onChange(internalSelected);
    }, [internalSelected]);

    const _selected = selected ?? internalSelected;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", justifyItems: "center", columnGap: PIXEL_SIZING.large, position: "relative" }}>
            {
                items.map(({ label, value }) =>
                    <TabOption 
                        selected={value === _selected}
                        onClick={() => setInternalSelected(value)}
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
                    bottom: -21,
                }}
            />
        </div>
    );
};

export default props => {
    const router = useRouter();

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", alignItems: "center", position: "relative" }}>
            <div style={{ width: "fit-content", position: "absolute" }}>
                <Text>
                    Bitcoin / Ethereum
                </Text>
            </div>

            <div style={{ justifySelf: "center", }}>
                <TabNav
                    onChange={selected => router.push(`/app/${selected}`)}
                    items={[
                        { label: "Dashboard", value: "dashboard" }, 
                        { label: "Swap", value: "swap" }, 
                        { label: "Options", value: "options" },
                    ]}
                />
            </div>

            <div style={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)" }}>
                <Link href={"/app/wallet-connect"}>
                    <Button>
                        Connect Wallet
                    </Button>
                </Link>
            </div>
        </div>
    );
};