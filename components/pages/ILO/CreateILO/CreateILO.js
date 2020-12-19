import { CONTAINER_SIZING, PIXEL_SIZING, TIMEFRAMES } from "../../../../utils/constants";
import { Layout } from "../../../layout/Layout";
import styled from "styled-components";
import Text from "../../../core/Text";
import { AddButton, Button, TextButton } from "../../../core/Button";
import Link from "next/link";
import { Card } from "../../../core/Card";
import { InputAndLabel } from "../../../core/InputAndLabel";
import { Input } from "../../../core/Input";
import { TextAreaInput } from "../../../core/TextAreaInput";
import { TokenAndLogo } from "../../../core/TokenAndLogo";
import { createRef, useContext, useEffect, useState } from "react";
import { EthersContext } from "../../../../context/Ethers";
import { SliderInput } from "../../../core/SliderInput";
import { RadioInput } from "../../../core/RadioInput";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { TokenPairContext } from "../../../../context/TokenPair";
import { ContentAndArrow } from "../../../core/ContentAndArrow";
import { DateTimeInput } from "../../../core/DateTimeInput";
import { TokenSelectInput } from "../../../core/TokenSelectInput";
import { FixedPriceInput } from "./FixedPriceInput";
import { xor } from "lodash";
import { SubmitContext, useContractApproval } from "../../../../utils/hooks";
import { DutchAuctionInput } from "./DutchAuctionInput";

const Container = styled.div`
    margin-top: ${PIXEL_SIZING.large};
    display: grid;
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

        #go-back-ilo-button {
            justify-items: left;
            grid-template-columns: auto 1fr;
            width: fit-content;
        }
    }
`;

const ILO_TYPES = {
    dutchAuction: "DUTCH_AUCTION",
    fixedPrice: "FIXED_PRICE",
};

export const CreateILO = () => {
    const { ETHEREUM_TOKEN, contracts: { ILOFactory }} = useContext(EthersContext);
    const { assetToken = {}} = useContext(TokenPairContext);    
    const { approveContract: approveIloFactory } = useContractApproval(
        ILOFactory, 
        [assetToken]
    );
    
    const [isLoading, setIsLoading] = useState();
    const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);
    const [name, setName] = useState();
    const [description, setDescription] = useState();
    const [iloType, setIloType] = useState(ILO_TYPES.fixedPrice);
    const [softCap, setSoftCap] = useState();
    const [percentageOfLiquidityToLock, setPercentageOfLiquidityToLock] = useState();
    const [liquidityUnlockDate, setLiquidityUnlockDate] = useState(new Date(Date.now() + TIMEFRAMES["1d"] * 3));
    const [isSubmitted, setIsSubmitted] = useState();

    const [inputRefs] = useState({});

    const onSubmit = async () => {
        setIsSubmitted(true);
        setIsLoading(true);
        try {
            await inputRefs[iloType].Submit(
                approveIloFactory,
                {
                    name, 
                    description,
                    percentageOfLiquidityToLock,
                    liquidityUnlockDate,
                    softCap,
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SubmitContext.Provider value={{ isSubmitted }}>
            <Layout style={{ width: "fit-content" }}>
                <Container>
                    <TitleContainer>
                        <Text primary bold>Create an Initial Liquidity Offering</Text>
                    </TitleContainer>

                    <Card style={{ width: CONTAINER_SIZING.large, padding: PIXEL_SIZING.large }}>
                        <div style={{ display: "grid", rowGap: PIXEL_SIZING.large }}>
                            <div style={{ display: "grid", rowGap: PIXEL_SIZING.large,}}>
                                <InputAndLabel>
                                    <Text>ILO Name</Text>
                                    <Input
                                        placeholder={"HappyCoin Seed Round"}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        isError={(isSubmitted && !name) || name?.length > 60}
                                        errorMessage={
                                            !name ? "Name is required" 
                                                : name.length > 60 ? "Cannot be longer than 60 characters" 
                                                    : ""
                                        }
                                    />
                                </InputAndLabel>
                            
                                <InputAndLabel>
                                    <Text>Description</Text>
                                    <TextAreaInput
                                        placeholder={"HappyCoin is a coin that makes people smile"}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        isError={(isSubmitted && !description) || description?.length > 250}
                                        setIsSubmitted                    errorMessage={
                                            !description ? "Description is required" 
                                                : description.length > 250 ? "Cannot be longer than 250 characters" 
                                                    : ""
                                        }
                                    />
                                </InputAndLabel>
                                
                                <InputAndLabel>
                                    <Text>Token to Sell</Text>
                                    <TokenSelectInput 
                                        value={assetToken}
                                        type={"ASSET"}
                                    />
                                </InputAndLabel>

                                <InputAndLabel>
                                    <Text>What type of sale do you want?</Text>
                                    <RadioInput
                                        options={[
                                            { value: ILO_TYPES.dutchAuction, label: "Dutch Auction" },
                                            { value: ILO_TYPES.fixedPrice, label: "Fixed Price" }
                                        ]}
                                        value={iloType}
                                        onChange={setIloType}
                                    />
                                </InputAndLabel>

                                {
                                    (() => {
                                        switch (iloType) {
                                            case ILO_TYPES.dutchAuction:
                                                return <DutchAuctionInput
                                                    ref={e => inputRefs[ILO_TYPES.dutchAuction] = e}
                                                />;
                                            case ILO_TYPES.fixedPrice:
                                                return <FixedPriceInput 
                                                    ref={e => inputRefs[ILO_TYPES.fixedPrice] = e}
                                                />;
                                            default:
                                                return <FixedPriceInput/>;
                                        }
                                    })()
                                }

                                <TextButton 
                                    onClick={() => setShowAdditionalOptions(!showAdditionalOptions)}
                                    style={{ justifySelf: "right" }}
                                >
                                    {showAdditionalOptions ? "Hide" : "Show"} additional options
                                </TextButton>

                                {
                                    showAdditionalOptions &&
                                        <>
                                            {
                                                iloType === ILO_TYPES.fixedPrice &&   
                                                    <InputAndLabel>
                                                        <Text>Soft Cap (Optional)</Text>
                                                        <TokenAmountInput
                                                            token={ETHEREUM_TOKEN}
                                                            onChange={e => setSoftCap(e.target.value)}
                                                            value={softCap}
                                                        />
                                                    </InputAndLabel>
                                            }

                                            <InputAndLabel>
                                                <Text>Percentage of Amount Raised to Lock in Liquidity (Optional)</Text>
                                                <SliderInput
                                                    value={percentageOfLiquidityToLock}
                                                    onChange={(e, value) => setPercentageOfLiquidityToLock(value)}
                                                />
                                            </InputAndLabel>

                                            <InputAndLabel>
                                                <Text>Liquidity Unlock Date (Optional)</Text>
                                            
                                                <DateTimeInput
                                                    value={liquidityUnlockDate}
                                                    onChange={setLiquidityUnlockDate}
                                                />
                                            </InputAndLabel>
                                        </>
                                }
                            </div>

                            <Button 
                                primary 
                                style={{ width: "100%" }} 
                                onClick={onSubmit}
                                isLoading={isLoading}
                                requiresWallet
                            >
                                Launch Initial Liquidity Offering
                            </Button>
                        </div>
                    </Card>
                </Container>
            </Layout>
        </SubmitContext.Provider>
    );
}