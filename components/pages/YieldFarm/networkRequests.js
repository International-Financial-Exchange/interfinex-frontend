import { getRequest } from "../../../utils/network";

export const getYieldFarms = ({ limit }) => {
    return getRequest("/yieldFarm/farms", { limit, });
};