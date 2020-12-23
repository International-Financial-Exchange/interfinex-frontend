import { getRequest } from "../../../utils/network";

export const getIloList = ({ limit, sortType, offset }) => {
    return getRequest("/ilo/list", { limit, sortType, offset });
};

export const getUserIlos = ({ limit, user, offset }) => {
    return getRequest("/ilo/userIlos", { limit, user, offset });
};

export const getIloItem = ({ contractAddress, id }) => {
    return getRequest("/ilo/item", { contractAddress, id, });
};

export const getIloDepositHistory = ({ contractAddress, user, offset, limit }) => {
    return getRequest("/ilo/depositHistory", { contractAddress, user, offset, limit });
};