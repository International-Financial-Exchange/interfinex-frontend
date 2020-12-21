import { getRequest } from "../../../../utils/network";

export const getFundingHistory = ({ from, to, marginMarketContract, limit, user }) => {
    return getRequest("/marginMarket/fundingHistory", { from, to, marginMarketContract, limit, user });
};

export const getMarginPositions = ({ marginMarketContract, limit, user, offset }) => {
    return getRequest("/marginMarket/positions", { marginMarketContract, limit, user, offset });
};