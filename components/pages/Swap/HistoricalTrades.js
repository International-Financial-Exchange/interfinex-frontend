import styled from "styled-components";
import { PIXEL_SIZING, CONTAINER_SIZING, MULTIPLIER, humanizeTokenAmount, useForceUpdate } from "../../../utils";
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
import InfiniteScroll from "react-infinite-scroller";

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

const TradeRowContainer = styled.div`
    background-color: ${({ theme, isBuy }) => shade(isBuy ? theme.colors.positive : theme.colors.negative, 0.9)};
    border-radius: ${PIXEL_SIZING.microscopic};
    display: grid;
    color: ${({ theme, isBuy }) => isBuy ? theme.colors.positive : theme.colors.negative};
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    column-gap: ${PIXEL_SIZING.larger};
    padding: ${PIXEL_SIZING.tiny};
    justify-items: center;
    transition: transform 0.05s ease-out;

    @media (max-width: 1000px) {
        grid-template-columns: 1fr 1fr 1fr 1fr;
        div:nth-child(5) {
            display: none;
        }
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr 1fr;
        div:nth-child(4) {
            display: none;
        }
    }

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
    background-color: ${({ theme }) => theme.colors.invert} !important;
    border: 0 !important;
    
    &:hover {
        cursor: default !important;
        transform: scale(1.0) !important;
    }
`;

let isLoading = false;
const useHistoricalTrades = query => {
    const [trades, setTrades] = useState([]);
    const [gotAllTrades, setGotAllTrades] = useState(false);
    const [oldestTradeTimestamp, setOldestTradeTimestamp] = useState();
    const forceUpdate = useForceUpdate();
    const [_isLoading, setIsLoading] = useState(false);

    const getMoreTrades = async () => {
        if (isLoading || !query.exchangeContract || gotAllTrades) return;
        
        isLoading = true;
        setIsLoading(true);
        try {
            const trades = await getHistoricalTrades({ 
                ...query,
                limit: 10,
                to: oldestTradeTimestamp,
                from: 0,  
            });
            
            setTrades(existing => existing.concat(trades));
            setOldestTradeTimestamp(trades.last()?.timestamp)
            if (trades.length === 0) setGotAllTrades(true);
            isLoading = false;
            setIsLoading(false)
        } catch {
            setTimeout(() => {
                isLoading = false
                setIsLoading(false);
            }, 3000);
        }
    };

    return [trades, getMoreTrades, _isLoading, gotAllTrades];
};

export const HistoricalTrades = () => {
    const TABS = { historicalTrades: "HISTORICAL", yourTrades: "YOUR_TRADES" };
    
    const { exchangeContract, } = useContext(SwapContext);
    const { baseToken, assetToken, token0, token1 } = useContext(TokenPairContext);
    const { address } = useContext(AccountContext);
    const [historicalTrades, getMoreHistoricalTrades, isHistoricalTradesLoading, gotAllHistoricalTrades] = useHistoricalTrades({ exchangeContract: exchangeContract?.address });
    const [yourTrades, getMoreYourTrades, isYourTradesLoading, gotAllYourTrades] = useHistoricalTrades({ exchangeContract: exchangeContract?.address, user: address });
    const [selectedTab, setSelectedTab] = useState(TABS.historicalTrades);

    const trades = useMemo(() => {
        const trades = selectedTab === TABS.historicalTrades ? historicalTrades : yourTrades;

        return trades
            ?.map(({ assetTokenAmount, baseTokenAmount, timestamp, user, txId, isBuy }) => {
                const isInverted = baseToken.address !== token0.address;
                const [humanizedBaseTokenAmount, humanizedAssetTokenAmount] = [
                    humanizeTokenAmount(baseTokenAmount, isInverted ? assetToken : baseToken), 
                    humanizeTokenAmount(assetTokenAmount, isInverted ? baseToken : assetToken)
                ];
                
                return {
                    price: isInverted ? humanizedAssetTokenAmount / humanizedBaseTokenAmount : humanizedBaseTokenAmount / humanizedAssetTokenAmount,
                    volume: isInverted ? humanizedAssetTokenAmount : humanizedBaseTokenAmount,
                    timestamp: timestamp,
                    user,
                    txId,
                    isBuy: isInverted ? !isBuy : isBuy,
                }
            })
            ?.sort((a, b) => b.timestamp - a.timestamp);
    }, [historicalTrades, yourTrades, selectedTab]);

    const isLoading = (selectedTab === TABS.historicalTrades && isHistoricalTradesLoading) 
        || (selectedTab === TABS.yourTrades && isYourTradesLoading);

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
                <InfiniteScroll
                    loadMore={() => {
                        getMoreHistoricalTrades();
                        getMoreYourTrades();
                    }}
                    hasMore={selectedTab === TABS.historicalTrades ? !gotAllHistoricalTrades : !gotAllYourTrades}
                    useWindow={false}
                >
                    <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny, }}>
                        <TradeHeaderContainer key={"n"}>
                            <Text secondary>Price</Text>
                            <Text secondary>Volume ({ baseToken.symbol })</Text>
                            <Text secondary>Timestamp</Text>
                            <Text secondary>User</Text>
                            <Text secondary>Tx. ID</Text>
                        </TradeHeaderContainer>

                        {
                            (!trades || trades.length === 0) && !isLoading ?
                                <Text secondary className={"center-absolute"}>No trades to show</Text>
                                : trades.map(({ price, volume, timestamp, user, txId, isBuy }) =>
                                    <TradeRowContainer 
                                        isBuy={isBuy} 
                                        key={txId} 
                                        onClick={() => window.open(`https://etherscan.io/tx/${txId}`)}
                                    >
                                        <div>{price.toFixed(6)}</div>
                                        <div>{volume.toFixed(6)}</div>
                                        <div>{new Date(timestamp).toLocaleTimeString()}</div>
                                        <div>{user}</div>
                                        <div>{txId}</div>
                                    </TradeRowContainer>
                                )
                        }

                        {
                            isLoading &&
                                <Spinner style={{ marginTop: PIXEL_SIZING.medium, marginBottom: PIXEL_SIZING.medium, marginLeft: "50%", transform: "translateX(-12px)" }}/>
                        }
                    </div>
                </InfiniteScroll>
            </Container>
        </div>
    );
};