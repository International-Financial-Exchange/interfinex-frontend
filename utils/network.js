import { SERVER_URL } from "../ENV";

export const getRequest = (endpoint, params = {}, isJSON = true) => {
    const urlParams = Object.entries(params).reduce(
        (paramsStr, [key, value]) => value ? paramsStr.concat(`&${key}=${value}`) : paramsStr, 
        ""
    );

    const url = `${SERVER_URL}${endpoint}?${urlParams}`;
    console.log("server", url);

    if (isJSON) 
        return fetch(url).then(res => res.json());

    return fetch(url);
};
