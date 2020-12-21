import { useEffect, useState } from "react";
import { getIloItem } from "./networkRequests";

export const useIlo = ({ contractAddress, iloJson }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [ilo, setIlo] = useState();

    useEffect(() => {
        if (iloJson) {
            setIlo(JSON.parse(iloJson));
            setIsLoading(false);
        } else {
            getIloItem({ contractAddress })
                .then(ilo => {
                    setIlo(ilo);
                    setIsLoading(false);
                });
        }
    }, []);

    return [ilo, isLoading];
};