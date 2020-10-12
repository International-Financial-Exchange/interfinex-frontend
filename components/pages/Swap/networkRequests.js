import { getRequest } from "../../../utils";

export const getHistoricalTrades = ({ from, to, exchangeContract, limit, user }) => {
    return getRequest("/swap/tradesHistory", { from, to, exchangeContract, limit });
};