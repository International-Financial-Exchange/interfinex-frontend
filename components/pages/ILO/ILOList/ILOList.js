import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Layout } from "../../../layout/Layout";
import styled, { ThemeContext } from "styled-components";
import Text from "../../../core/Text";
import { AddButton } from "../../../core/Button";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { getIloList } from "../networkRequests";
import InfiniteScroll from "react-infinite-scroller";
import { Spinner } from "../../../core/Spinner";
import { InfiniteFooterScroll } from "../../../core/InfiniteFooterScroll";
import { CardButton } from "../../../core/CardButton";
import { ILOListItem } from "./ILOListItem";
import { FilterOption } from "../../../core/FilterOption";
import { HotIcon, NewIcon, TimeIcon, TopIcon } from "./FilterIcons";
import Skeleton from "react-loading-skeleton";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    height: fit-content;
    row-gap: ${PIXEL_SIZING.large};
`;

const TitleContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
    align-items: center;
    margin-top: ${PIXEL_SIZING.medium};

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        row-gap: ${PIXEL_SIZING.medium};

        #create-ilo-button {
            justify-items: left;
            grid-template-columns: auto 1fr;
            width: fit-content;
        }
    }
`;

export const useIloList = ({ limit, sortType }) => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [gotAllItems, setGotAllItems] = useState(false);

    const getMoreItems = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const newItems = await getIloList({ 
            limit, 
            sortType, 
            offset: list.length,
        });

        setGotAllItems(newItems.length === 0);

        // Remove the duplicates
        setList(existing => {
            if (newItems.every(({ txId }) => !existing.some(({ txId: _txId }) => txId === txId))) {
                return existing.concat(newItems);
            };

            return existing;
        });

        setIsLoading(false);
    };

    useEffect(() => {
        getMoreItems();
    }, []);

    return { list, isLoading, getMoreItems, gotAllItems };
};

const SORT_TYPES = {
    hot: { value: 0, label: "Hot", icon: <HotIcon/> }, 
    new: { value: 1, label: "New", icon: <NewIcon/> }, 
    top: { value: 2, label: "Top", icon: <TopIcon/> }, 
    timeLeft: { value: 3, label: "Time Left", icon: <TimeIcon/> }, 
};

export const ILOList = () => {
    const listItems = {
        [SORT_TYPES.hot.value]: useIloList({ sortType: SORT_TYPES.hot.value }),
        [SORT_TYPES.new.value]: useIloList({ sortType: SORT_TYPES.new.value }),
        [SORT_TYPES.top.value]: useIloList({ sortType: SORT_TYPES.top.value }),
        [SORT_TYPES.timeLeft.value]: useIloList({ sortType: SORT_TYPES.timeLeft.value }),
    };

    const theme = useContext(ThemeContext);
    const [selectedSortType, setSelectedSortType] = useState(SORT_TYPES.hot.value);

    console.log("selected", selectedSortType);

    return (
        <Layout style={{ maxWidth: 1090 }}>
            <Container>
                <TitleContainer>
                    <Text primary bold>Initial Liquidity Offerings</Text>
                    <Link href="/app/ilo/create">
                        <AddButton id="create-ilo-button">
                            Create New ILO
                        </AddButton>
                    </Link>
                </TitleContainer>

                <div style={{ display: "flex", width: "100%", overflow: "auto" }}>
                    {
                        Object.values(SORT_TYPES).map(({ value, label, icon }) => 
                            <FilterOption
                                icon={icon}
                                text={label}
                                onClick={() => setSelectedSortType(value)}
                                selected={value === selectedSortType}
                            />
                        )
                    }
                </div>

                <div>
                    <InfiniteFooterScroll
                        loadMore={listItems[selectedSortType].getMoreItems}
                        hasMore={!listItems[selectedSortType].gotAllItems}
                    >  
                        <div 
                            style={{ 
                                display: "flex", 
                                justifyContent: "space-between",
                                width: "100%",
                                flexWrap: "wrap",
                            }}
                        >
                            {
                                listItems[selectedSortType].list.map(ilo =>
                                    <ILOListItem
                                        key={ilo.contractAddress}
                                        ilo={ilo}
                                    />
                                )
                            }


                            {
                               listItems[selectedSortType].isLoading &&
                                    <>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                        <Skeleton style={{ margin: `0 ${PIXEL_SIZING.small} ${PIXEL_SIZING.large} ${PIXEL_SIZING.small}` }} height={CONTAINER_SIZING.small} width={CONTAINER_SIZING.small}/>
                                    </>
                            }
                        </div>
                    </InfiniteFooterScroll>
                </div>
            </Container>
        </Layout>
    );
};