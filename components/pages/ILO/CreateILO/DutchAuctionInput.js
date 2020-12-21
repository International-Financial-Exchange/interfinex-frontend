import { forwardRef, useContext, useImperativeHandle, useState } from "react";
import { EthersContext } from "../../../../context/Ethers";
import { NotificationsContext } from "../../../../context/Notifications";
import { TokenPairContext } from "../../../../context/TokenPair";
import { PIXEL_SIZING, TIMEFRAMES } from "../../../../utils/constants";
import { SubmitContext } from "../../../../utils/hooks";
import { parseTokenAmount } from "../../../../utils/utils";
import { DateTimeInput } from "../../../core/DateTimeInput";
import { InputAndLabel } from "../../../core/InputAndLabel";
import Text from "../../../core/Text";
import { TokenAmountInput } from "../../../core/TokenAmountInput";
import { TokenAndLogo } from "../../../core/TokenAndLogo";

export const DutchAuctionInput = forwardRef((props, ref) => {
    const { isSubmitted } = useContext(SubmitContext);
    const { ETHEREUM_TOKEN, contracts: { ILOFactory }} = useContext(EthersContext);
    const { assetToken = {}} = useContext(TokenPairContext);
    const { addTransactionNotification } = useContext(NotificationsContext);

    const [assetTokenAmount, setAssetTokenAmount] = useState();
    const [startPrice, setStartPrice] = useState();
    const [endPrice, setEndPrice] = useState();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + TIMEFRAMES["1d"]));

    const validate = (name, description) => {
        const validations = {
            name: name && name.length <= 60,
            description: description && description.length <= 250,
            startPrice: startPrice > 0,
            endPrice: endPrice > 0 && endPrice < startPrice,
            assetTokenAmount: assetTokenAmount > 0,
            timerange: startDate.getTime() < endDate.getTime(),
        };

        return Object.values(validations).every(v => v);
    };

    useImperativeHandle(ref, () => ({
        Submit: async (approveIloFactory, {
            name, 
            description,
            percentageOfLiquidityToLock = 0,
            liquidityUnlockDate = 0,
            softCap = 0,
        }) => {
            if (!validate(name, description)) return Promise.reject("Invalid inputs");

            await approveIloFactory();
            await addTransactionNotification({
                content: `Create Dutch Auction ILO for ${assetToken.name}`,
                transactionPromise: ILOFactory.createDutchAuctionILO(
                    assetToken.address,
                    parseTokenAmount(assetTokenAmount, assetToken),
                    parseTokenAmount(1 / startPrice, assetToken),
                    parseTokenAmount(1 / endPrice, assetToken),
                    Math.floor(startDate.getTime() / 1000),
                    Math.floor(endDate.getTime() / 1000),
                    percentageOfLiquidityToLock,
                    liquidityUnlockDate ? Math.floor(liquidityUnlockDate.getTime() / 1000) : 0,
                    name,
                    description,
                    { gasLimit: 900_000 },         
                )
            });
        },
    }));

    return (
        <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.medium }}>
                <InputAndLabel>
                    <Text>Starting Price (ETH per {assetToken.symbol})</Text>
                    <TokenAmountInput
                        token={ETHEREUM_TOKEN}
                        value={startPrice}
                        onChange={e => setStartPrice(e.target.value)}
                        isError={isSubmitted && !startPrice}
                        errorMessage={"Start price must be greater than 0"}
                    />
                </InputAndLabel>
                
                <InputAndLabel>
                    <Text>Ending Price (ETH per {assetToken.symbol})</Text>
                    <TokenAmountInput
                        token={ETHEREUM_TOKEN}
                        value={endPrice}
                        onChange={e => setEndPrice(e.target.value)}
                        isError={(isSubmitted && !endPrice) || endPrice >= startPrice}
                        errorMessage={
                            !endPrice ? `End price must be greater than 0`
                                : endPrice >= startPrice ? "End price must be less than start price"
                                    : ""
                        }
                    />
                </InputAndLabel>
            </div>

            <InputAndLabel>
                <Text>Amount of {assetToken.symbol} to sell</Text>
                <TokenAmountInput
                    token={assetToken}
                    onChange={e => setAssetTokenAmount(e.target.value)}
                    value={assetTokenAmount}
                    isError={isSubmitted && !assetTokenAmount}
                    errorMessage={`${assetToken.symbol} amount must be greater than 0`}
                />
            </InputAndLabel>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: PIXEL_SIZING.medium }}>
                <InputAndLabel>
                    <Text>Start Date</Text>
                    <DateTimeInput
                        value={startDate}
                        onChange={setStartDate}
                    />
                </InputAndLabel>

                <InputAndLabel>
                    <Text>End Date</Text>
                    <DateTimeInput
                        value={endDate}
                        onChange={setEndDate}
                        minDateMessage={"End date must be after start date"}
                        minDate={startDate}
                    />
                </InputAndLabel>
            </div>
        </>
    );
});