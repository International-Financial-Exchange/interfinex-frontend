import { getRequest } from "../../../utils/network";

export const getIloList = ({ limit, sortType, offset }) => {
    return getRequest("/ilo/list", { limit, sortType, offset });
};

export const getIloItem = ({ contractAddress, id }) => {
    return getRequest("/ilo/item", { contractAddress, id, });
};