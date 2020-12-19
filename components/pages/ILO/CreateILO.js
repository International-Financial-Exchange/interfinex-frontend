import { PIXEL_SIZING } from "../../../utils/constants";
import { Layout } from "../../layout/Layout";
import styled from "styled-components";
import Text from "../../core/Text";
import { AddButton, Button, TextButton } from "../../core/Button";
import Link from "next/link";
import { Card } from "../../core/Card";
import { InputAndLabel } from "../../core/InputAndLabel";
import { Input } from "../../core/Input";
import { TextAreaInput } from "../../core/TextAreaInput";
import { TokenAndLogo } from "../../core/TokenAndLogo";
import { useContext, useState } from "react";
import { EthersContext } from "../../../context/Ethers";
import { SliderInput } from "../../core/SliderInput";
import { RadioInput } from "../../core/RadioInput";
import { TokenAmountInput } from "../../core/TokenAmountInput";
import { TokenPairContext } from "../../../context/TokenPair";
import { ContentAndArrow } from "../../core/ContentAndArrow";

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
    const { ETHEREUM_TOKEN } = useContext(EthersContext);
    const { assetToken = {}} = useContext(TokenPairContext);
    const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

    return (
        <Layout>
            <Container>
                <TitleContainer>
                    <Text primary bold>Create an Initial Liquidity Offering</Text>
                </TitleContainer>

                <Card style={{ width: "100%", padding: PIXEL_SIZING.large }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        <div style={{ display: "grid", rowGap: PIXEL_SIZING.large }}>
                            <div style={{ display: "grid", rowGap: PIXEL_SIZING.large,}}>
                                <InputAndLabel>
                                    <Text>ILO Name</Text>
                                    <Input
                                        placeholder={"HappyCoin Seed Round"}
                                    />
                                </InputAndLabel>
                            
                                <InputAndLabel>
                                    <Text>Description</Text>
                                    <TextAreaInput
                                        placeholder={"HappyCoin is a coin that makes people smile"}
                                    />
                                </InputAndLabel>

                                <InputAndLabel>
                                    <Text>What type of sale do you want?</Text>
                                    <RadioInput
                                        options={[
                                            { value: ILO_TYPES.dutchAuction, label: "Dutch Auction" },
                                            { value: ILO_TYPES.fixedPrice, label: "Fixed Price" }
                                        ]}
                                    />
                                </InputAndLabel>
                                
                                <InputAndLabel>
                                    <Text>Token to Sell</Text>
                                    <ContentAndArrow
                                        secondary
                                        style={{ width: "fit-content" }}
                                    >
                                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.medium }}>
                                            <TokenAndLogo token={assetToken}/>
                                            <Text secondary>(Click to Change)</Text> 
                                        </div>
                                    </ContentAndArrow>
                                </InputAndLabel>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.large }}>
                                    <InputAndLabel>
                                        <Text>Amount of {assetToken.name} to sell</Text>
                                        <TokenAmountInput
                                            token={assetToken}
                                        />
                                    </InputAndLabel>

                                    <InputAndLabel>
                                        <Text>Amount of Ethereum to raise</Text>
                                        <TokenAmountInput
                                            token={ETHEREUM_TOKEN}
                                        />
                                    </InputAndLabel>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", alignItems: "center", columnGap: PIXEL_SIZING.small }}>
                                    <TokenAndLogo token={ETHEREUM_TOKEN}>
                                        <Text>1 {ETHEREUM_TOKEN.symbol}</Text>
                                    </TokenAndLogo>
                                    <Text>=</Text>
                                    <TokenAndLogo token={assetToken}>
                                        <Text>100 {assetToken.symbol}</Text>
                                    </TokenAndLogo>
                                </div>

                                <TextButton 
                                    onClick={() => setShowAdditionalOptions(!showAdditionalOptions)}
                                    style={{ justifySelf: "right" }}
                                >
                                    {showAdditionalOptions ? "Hide" : "Show"} additional options
                                </TextButton>

                                {
                                    showAdditionalOptions &&
                                        <>
                                            <InputAndLabel>
                                                <Text>Soft Cap (Optional)</Text>
                                                <TokenAmountInput
                                                    token={ETHEREUM_TOKEN}
                                                />
                                            </InputAndLabel>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.medium }}>
                                                <InputAndLabel>
                                                    <Text>Start Date (Optional)</Text>
                                                    <Input

                                                    />
                                                </InputAndLabel>

                                                <InputAndLabel>
                                                    <Text>End Date (Optional)</Text>
                                                    <Input

                                                    />
                                                </InputAndLabel>
                                            </div>

                                            <InputAndLabel>
                                                <Text>Percentage of Amount Raised to Lock in Liquidity (Optional)</Text>
                                                <SliderInput

                                                />
                                            </InputAndLabel>

                                            <InputAndLabel>
                                                <Text>Liquidity Unlock Date (Optional)</Text>
                                                <Input

                                                />
                                            </InputAndLabel>
                                        </>
                                }

                            </div>
                        </div>
                    </div>

                </Card>
            </Container>
        </Layout>
    );
}