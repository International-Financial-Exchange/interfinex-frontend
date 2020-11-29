import { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { Button, TextButton } from "../../../../core/Button";
import Text from "../../../../core/Text";
import { PROPOSAL_INFO, VOTING_OPTIONS, VoteContext, PROPOSAL_IDS } from "./VoteTab";
import Countdown from 'react-countdown';
import Skeleton from "react-loading-skeleton";
import { Modal } from "../../../../layout/Modal";
import { ModalCard } from "../../../../core/ModalCard";
import { NotificationsContext } from "../../../../../context/Notifications";
import { TokenAmountInput } from "../../../../core/TokenAmountInput";
import { TokenPairContext } from "../../../../../context/TokenPair";
import { MarginContext } from "../../Swap";
import { AccountContext } from "../../../../../context/Account";
import { InfoBubble } from "../../../../core/InfoBubble";
import { add } from "lodash";
import { CONTAINER_SIZING, PIXEL_SIZING } from "../../../../../utils/constants";
import { humanizeTokenAmount, parseTokenAmount } from "../../../../../utils/utils";

const useVotes = ({ proposalId, MarginMarket, }) => {
    const [votesCast, setVotesCast] = useState({ up: 0, preserve: 0, down: 0 });
    const [account, setAccount] = useState();
    const [currentValue, setCurrentValue] = useState();
    const [finishDate, setFinishDate] = useState();
    const [isLoading, setIsLoading] = useState();
    const { addTransactionNotification } = useContext(NotificationsContext);
    const { ifexToken } = useContext(TokenPairContext);
    const { approveMarginMarket: _approveMarginMarket } = useContext(MarginContext);
    const { selectedToken } = useContext(VoteContext);
    const { address } = useContext(AccountContext);

    const approveMarginMarket = _approveMarginMarket[selectedToken.address];

    const updateVotesCast = async () => {
        const [up, down, preserve] = (await Promise.all([
            MarginMarket.proposalVotes(proposalId, VOTING_OPTIONS.up, { gasLimit: 1_000_000 }),
            MarginMarket.proposalVotes(proposalId, VOTING_OPTIONS.down, { gasLimit: 1_000_000 }),
            MarginMarket.proposalVotes(proposalId, VOTING_OPTIONS.preserve, { gasLimit: 1_000_000 }),
        ])).map(res => humanizeTokenAmount(res, { decimals: 18 }));

        setVotesCast({ up, down, preserve, total: up + down + preserve });
    }

    const updateCurrentValue = async () => {
        setCurrentValue(await MarginMarket[PROPOSAL_INFO[proposalId].contractKey]({ gasLimit: 1_000_000 }));
    };

    const updateFinishDate = async () => {
        setFinishDate((await MarginMarket.proposalFinalisationDate(proposalId, { gasLimit: 1_000_000 })) * 1000);
    }

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            updateVotesCast(),
            updateCurrentValue(),
            updateFinishDate(),
        ])
            .then(() => setIsLoading(false));
    }, [MarginMarket.address]);

    const updateAccount = async () => {
        setAccount();
        const votesDeposited = humanizeTokenAmount(await MarginMarket.userVotes(address, proposalId), ifexToken);
        const userLastVote = humanizeTokenAmount(await MarginMarket.userLastVote(address, proposalId), { decimals: 0 }) * 1000;
        setAccount({
            votesDeposited,
            isVoting: userLastVote === finishDate,
            isLoading: false,
        });
    }

    useEffect(() => {
        if (address)
            updateAccount();
    }, [MarginMarket.address, address, finishDate]);

    const depositVote = async (voteOption, amount) => {
        await approveMarginMarket(ifexToken);
        await addTransactionNotification({
            content: `Deposit vote in margin market proposal ${PROPOSAL_INFO[proposalId].name}`,
            transactionPromise: MarginMarket.depositVote(proposalId, voteOption, parseTokenAmount(amount, ifexToken)),
        });
    };

    const withdrawVote = async () => {
        await addTransactionNotification({
            content: `Withdraw vote from margin market proposal ${PROPOSAL_INFO[proposalId].name}`,
            transactionPromise: MarginMarket.withdrawVote(proposalId),
        });
    }

    const finalizeVote = async () => {
        await addTransactionNotification({
            content: `Finalize vote for margin market proposal ${PROPOSAL_INFO[proposalId].name}`,
            transactionPromise: MarginMarket.finalizeVote(proposalId),
        });
    }

    return [votesCast, isLoading, currentValue, finishDate, depositVote, account, withdrawVote, finalizeVote];
};

const Container = styled.div`
    border-radius: ${PIXEL_SIZING.miniscule};
    box-shadow: 0 0 17px 0 rgba(0, 0, 0, 0.18);
    display: grid;
    row-gap: ${PIXEL_SIZING.small};
    width: ${CONTAINER_SIZING.medium};
    height: fit-content;
    padding: ${PIXEL_SIZING.small};
`;

const CastVotesPreview = ({ values = [], totalCount }) => {
    const theme = useContext(ThemeContext);

    return (
        <div style={{ display: "grid", rowGap: PIXEL_SIZING.tiny }}>
            {
                values.map(({ text, color, count }) =>
                    <div>
                        <Text secondary>{text} ({count} votes)</Text>
                        <div 
                            style={{ 
                                position: "relative",
                                marginTop: PIXEL_SIZING.tiny,
                                width: "100%", 
                                height: PIXEL_SIZING.small, 
                                backgroundColor: theme.colors.highlight, 
                                borderRadius: PIXEL_SIZING.miniscule,
                                overflow: "hidden",
                            }}
                        >
                            <div 
                                style={{ 
                                    height: "100%", 
                                    width: `${count > 0 ? (count / totalCount * 100) : 0}%`, 
                                    backgroundColor: color || theme.colors.positive, 
                                    borderRadius: "inherit" 
                                }}
                            />
                        </div>
                    </div>
                )
            }

        </div>
    )
};

export const VotePortal = ({ proposalId, MarginMarket }) => {
    const [
        votesCast, 
        isLoading, 
        currentValue, 
        finishDate, 
        depositVote,
        account,
        withdrawVote,
        finalizeVote,
    ] = useVotes({ proposalId, MarginMarket });

    const { name, multiplier, formatValue } = PROPOSAL_INFO[proposalId];
    const [showDetails, setShowDetails] = useState(false);
    const { selectedToken } = useContext(VoteContext);
    const theme = useContext(ThemeContext);
    const [isFinalizeLoading, setIsFinalizeLoading] = useState();

    const castVotesValues = [
        { 
            text: `Increase to ${formatValue(currentValue?.add(currentValue.mul(multiplier.toString()).div(100)) ?? 0, selectedToken)}`, 
            color: theme.colors.positive, 
            count: votesCast.up 
        },
        { 
            text: `Preserve at ${formatValue(currentValue ?? 0, selectedToken)}`, 
            color: theme.colors.secondary, 
            count: votesCast.preserve 
        },
        { 
            text: `Decrease to ${formatValue(currentValue?.sub(currentValue.mul(multiplier.toString()).div(100)) ?? 0, selectedToken)}`, 
            color: theme.colors.negative, 
            count: votesCast.down 
        },
    ];

    return (
        <Container>
            {
                showDetails &&
                    <VoteDetails 
                        proposalId={proposalId}
                        account={account}
                        votesCast={votesCast}
                        depositVote={depositVote}
                        finishDate={finishDate}
                        castVotesValues={castVotesValues}
                        onClose={() => setShowDetails(false)}
                        withdrawVote={withdrawVote}
                    />
            }
            <Text bold>
                {name}
            </Text>
            {
                isLoading ?
                    <>
                        <Skeleton height={PIXEL_SIZING.medium}/>
                        <Skeleton height={CONTAINER_SIZING.tiny}/>
                    </>
                : 
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.miniscule }}>
                            <Text>Vote Finishes In:</Text>
                            <Countdown date={finishDate}>
                                <Text bold style={{ color: theme.colors.positive }}>Vote Finished!</Text>
                            </Countdown>
                        </div>

                        <CastVotesPreview
                            totalCount={votesCast.total}
                            values={castVotesValues}
                        />

                        <Button style={{ width: "100%" }} onClick={() => setShowDetails(true)}>
                            View Vote
                        </Button>

                        {
                            Date.now() > finishDate &&
                                <Button 
                                    secondary 
                                    requiresWallet
                                    style={{ width: "100%" }} 
                                    isLoading={isFinalizeLoading}
                                    onClick={() => {
                                        setIsFinalizeLoading(true);
                                        finalizeVote().finally(() => setIsFinalizeLoading(false))
                                    }}
                                >
                                    Finalize Vote
                                </Button>
                        }
                    </>
            }
        </Container>
    );
};

const VoteDetailsContainer = styled.div`
    padding: ${PIXEL_SIZING.medium};
    width: ${CONTAINER_SIZING.large};
    min-width: ${CONTAINER_SIZING.medium};
    display: grid;
    row-gap: ${PIXEL_SIZING.large};

    #vote-details-buttons {
        display: grid; 
        grid-template-columns: 1fr 1fr 1fr; 
        width: 100%; 
        column-gap: ${PIXEL_SIZING.small};
    }

    @media (max-width: 750px) {
        height: 100%;
        width: 100%;

        #vote-details-buttons {
            grid-template-columns: 1fr; 
            row-gap: ${PIXEL_SIZING.small};
        }
    }
`;

const VoteDetails = ({ castVotesValues, proposalId, onClose, finishDate, votesCast, depositVote, account, withdrawVote }) => {
    const { name, multiplier, formatValue, description } = PROPOSAL_INFO[proposalId];
    const theme = useContext(ThemeContext);
    const { ifexToken } = useContext(TokenPairContext);
    const { ifexTokenBalance } = useContext(AccountContext);
    const [voteAmount, setVoteAmount] = useState();
    const [isIncreaseLoading, setIsIncreaseLoading] = useState();
    const [isPreserveLoading, setIsPreserveLoading] = useState();
    const [isDecreaseLoading, setIsDecreaseLoading] = useState();

    console.log("account", account);

    return (
        <Modal isOpen onClose={onClose} style={{ width: "100%", height: "100%" }}>
            <ModalCard>
                <VoteDetailsContainer>
                    <div>
                        <Text primary style={{ marginBottom: PIXEL_SIZING.small }}>{name}</Text>

                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: PIXEL_SIZING.miniscule }}>
                            <Text>Vote Finishes In:</Text>
                            <Countdown date={finishDate}>
                                <Text bold style={{ color: theme.colors.positive }}>Vote Finished!</Text>
                            </Countdown>
                        </div>
                    </div>

                    <div>
                        <Text bold secondary>Description</Text>
                        <Text style={{ marginTop: PIXEL_SIZING.tiny }}>{description}</Text>
                    </div>

                    <div>
                        <Text secondary bold style={{ marginBottom: PIXEL_SIZING.small }}>Votes Cast</Text>
                        <CastVotesPreview
                            totalCount={votesCast.total}
                            values={castVotesValues}
                        />
                    </div>

                    {
                        account?.votesDeposited > 0 ?
                            <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
                                <InfoBubble>
                                    You have voted with {account.votesDeposited} IFEX. You can withdraw your IFEX after the vote you participated in has been finalised and a consensus has been reached. 
                                </InfoBubble>   

                                { 
                                    account.votesDeposited > 0 && !account.isVoting &&
                                        <Button 
                                            secondary
                                            primary 
                                            style={{ width: "100%" }}
                                            onClick={withdrawVote}
                                        >
                                            Withdraw Vote
                                        </Button>
                                }
                            </div>
                        : 
                            <div style={{ display: "grid", rowGap: PIXEL_SIZING.small }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", width: "100%" }}>
                                    <Text secondary bold>Cast Your Vote</Text>
                                    <TextButton
                                        onClick={() => setVoteAmount(ifexTokenBalance)}
                                    >
                                        Max Amount
                                    </TextButton>
                                </div>
                                
                                <TokenAmountInput 
                                    token={ifexToken}
                                    value={voteAmount}
                                    onChange={e => setVoteAmount(e.target.value)}
                                />
                                
                                <div id={"vote-details-buttons"}>
                                    <Button 
                                        style={{ width: "100%", backgroundColor: theme.colors.positive }}
                                        onClick={() => {
                                            setIsIncreaseLoading(true);
                                            depositVote(VOTING_OPTIONS.up, voteAmount).finally(() => setIsIncreaseLoading(false))
                                        }}
                                        isLoading={isIncreaseLoading}
                                        requiresWallet
                                    >
                                        Vote Increase
                                    </Button>

                                    <Button 
                                        style={{ width: "100%", }}
                                        onClick={() => {
                                            setIsPreserveLoading(true);
                                            depositVote(VOTING_OPTIONS.preserve, voteAmount).finally(() => setIsPreserveLoading(false))
                                        }}
                                        isLoading={isPreserveLoading}
                                        requiresWallet
                                    >
                                        Vote Preserve
                                    </Button>

                                    <Button 
                                        style={{ width: "100%", backgroundColor: theme.colors.negative }}
                                        onClick={() => {
                                            setIsDecreaseLoading(true);
                                            depositVote(VOTING_OPTIONS.down, voteAmount).finally(() => setIsDecreaseLoading(false));
                                        }}
                                        isLoading={isDecreaseLoading}
                                        requiresWallet
                                    >
                                        Vote Decrease
                                    </Button>
                                </div>
                            </div>
                    }

                </VoteDetailsContainer>
            </ModalCard>
        </Modal>
    );
};