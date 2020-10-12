import styled from "styled-components";
import { PIXEL_SIZING, CONTAINER_SIZING, MULTIPLIER, humanizeTokenAmount } from "../../../utils";
import Text from "../../core/Text";
import { shade } from "../../../utils";
import { TextOption } from "../../core/TextOption";
import { useState, useEffect, useContext, useMemo } from "react";
import { getHistoricalTrades } from "./networkRequests";
import { SwapContext } from "./Swap";
import { AccountContext } from "../../../context/Account";
import { Spinner } from "../../core/Spinner";
import { BigNumber as BN } from "ethers";
import { TokenPairContext } from "../../../context/TokenPair";

const Container = styled.div`
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.highlight};
    border-radius: ${PIXEL_SIZING.miniscule};
    padding: ${PIXEL_SIZING.small};
    position: relative;
    height: ${CONTAINER_SIZING.medium};
    overflow: auto;
`;

const Table = styled.table`
    border-collapse: separate;
    border-spacing: 0 10px; 

    th {
        color: ${({ theme }) => theme.colors.textSecondary};
        font-weight: normal;
    }

    td {
        text-align: center;
        padding: ${PIXEL_SIZING.tiny};
    }
`;

const TradeRowContainer = styled.tr`
    background-color: ${({ theme, isBuy }) => shade(isBuy ? theme.colors.positive : theme.colors.negative, 0.9)};
    border-radius: ${PIXEL_SIZING.microscopic};
    display: grid;
    color: ${({ theme, isBuy }) => isBuy ? theme.colors.positive : theme.colors.negative};
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    column-gap: ${PIXEL_SIZING.larger};
    padding: ${PIXEL_SIZING.tiny};
    justify-items: center;
    transition: transform 0.05s ease-out;

    div {
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
    }

    &:hover {
        cursor: pointer;
        transform: scale(1.02);
    }
`;

const TradeHeaderContainer = styled(TradeRowContainer)`
    background-color: ${({ theme }) => theme.colors.invert};
    border: 0;

    &:hover {
        transform: scale(1.0);
    }
`;

export const HistoricalTrades = () => {
    const TABS = { historicalTrades: "HISTORICAL", yourTrades: "YOUR_TRADES" };
    
    const { exchangeContract, } = useContext(SwapContext);
    const { baseToken, assetToken, token0, token1 } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const [historicalTrades, setHistoricalTrades] = useState();
    const [yourTrades, setYourTrades] = useState();
    const [isYourTradesLoading, setIsYourTradesLoading] = useState(true);
    const [isHistoricalTradesLoading, setIsHistoricalTradesLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState(TABS.historicalTrades);

    useEffect(() => {
        // fetch trades
        if (exchangeContract) {
            getHistoricalTrades({ 
                limit: 10, 
                exchangeContract: exchangeContract.address, 
            })
                .then(trades => setHistoricalTrades(trades))
                .finally(() => setIsHistoricalTradesLoading(false));

            getHistoricalTrades({
                limit: 10,
                exchangeContract: exchangeContract.address, 
                user: address,
            })
                .then(trades => setYourTrades(trades))
                .finally(() => setIsYourTradesLoading(false));
        }
    }, [exchangeContract?.address]);

    const trades = useMemo(() => {
        const trades = selectedTab === TABS.historicalTrades ? historicalTrades : yourTrades;

        return trades?.map(({ assetTokenAmount, baseTokenAmount, timestamp, user, txId, isBuy }) => {
            const isInverted = baseToken.address !== token0.address;

            const [humanizedBaseTokenAmount, humanizedAssetTokenAmount] = [humanizeTokenAmount(baseTokenAmount, baseToken), humanizeTokenAmount(assetTokenAmount, assetToken)];
            return {
                price: isInverted ? humanizedAssetTokenAmount / humanizedBaseTokenAmount : humanizedBaseTokenAmount / humanizedAssetTokenAmount,
                volume: isInverted ? humanizedAssetTokenAmount : humanizedBaseTokenAmount,
                timestamp: timestamp,
                user,
                txId,
                isBuy: isInverted ? !isBuy : isBuy,
            }
        });
    }, [historicalTrades, yourTrades, selectedTab]);

    const isLoading = (selectedTab === TABS.historicalTrades && isHistoricalTradesLoading) 
        || (selectedTab === TABS.yourTrades && isYourTradesLoading);

    // TODO: Add in scroll to load with InfiniteScroll
    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.medium }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.small }}>
                <TextOption 
                    selected={selectedTab === TABS.historicalTrades}
                    onClick={() => setSelectedTab(TABS.historicalTrades)}
                >
                    All Trades
                </TextOption>

                <TextOption 
                    selected={selectedTab === TABS.yourTrades}
                    onClick={() => setSelectedTab(TABS.yourTrades)}
                >
                    Your Trades
                </TextOption>
            </div>

            <Container>
                <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, }}>
                    <TradeHeaderContainer>
                        <Text secondary>Price</Text>
                        <Text secondary>Volume ({ baseToken.symbol })</Text>
                        <Text secondary>Timestamp</Text>
                        <Text secondary>User</Text>
                        <Text secondary>Tx. ID</Text>
                    </TradeHeaderContainer>

                    {
                        isLoading &&
                                <Spinner
                                    style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                                />
                    }

                    {
                        trades?.map(({ price, volume, timestamp, user, txId, isBuy }) => 
                            <TradeRowContainer isBuy={isBuy}>
                                <div>{price.toFixed(6)}</div>
                                <div>{volume.toFixed(6)}</div>
                                <div>{ new Date(timestamp).toLocaleString()}</div>
                                <div>{user}</div>
                                <div>{txId}</div>
                            </TradeRowContainer>
                        )
                    }
                </div>
            </Container>
        </div>
    );
};