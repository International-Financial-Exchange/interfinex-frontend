import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../utils/constants";
import { Layout } from "../../../layout/Layout";
import styled from "styled-components";
import Text from "../../../core/Text";
import { AddButton } from "../../../core/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getIloList } from "../networkRequests";
import InfiniteScroll from "react-infinite-scroller";
import { Spinner } from "../../../core/Spinner";
import { InfiniteFooterScroll } from "../../../core/InfiniteFooterScroll";
import { CardButton } from "../../../core/CardButton";
import { ILOListItem } from "./ILOListItem";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
    grid-template-rows: auto 1fr;
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

        console.log(newItems)

        setGotAllItems(newItems.length === 0);
        setList(existing => existing.concat(newItems));
        setIsLoading(false);
    };

    return [list, isLoading, getMoreItems, gotAllItems];
};

export const ILOList = () => {
    const [list, isLoading, getMoreItems, gotAllItems] = useIloList({});

    return (
        <Layout>
            <Container>
                <TitleContainer>
                    <Text primary bold>Initial Liquidity Offerings</Text>
                    <Link href="/app/ilo/create">
                        <AddButton id="create-ilo-button">
                            Create New ILO
                        </AddButton>
                    </Link>
                </TitleContainer>

                <div>
                    <InfiniteFooterScroll
                        loadMore={getMoreItems}
                        hasMore={!gotAllItems}
                    >  
                        <div style={{ display: "flex", justifyContent: "space-around", width: "fit-content", maxWidth: "100%", flexWrap: "wrap", }}>
                            {
                                isLoading &&
                                    <Spinner/>
                            }

                            {
                                list.map(ilo =>
                                    <ILOListItem
                                        key={ilo.contractAddress}
                                        ilo={ilo}
                                    />
                                )
                            }
                        </div>
                    </InfiniteFooterScroll>
                </div>
            </Container>
        </Layout>
    );
};