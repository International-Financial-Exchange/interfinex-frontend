import { useEffect, useRef, useState } from "react";

export const InfiniteFooterScroll = ({ children, hasMore, loadMore, }) => {
    const [footer, setFooter] = useState(); 
    const [_callCount, setCallCount] = useState(0);
    const [_isLoading, setIsLoading] = useState();

    useEffect(() => {
        const footer = document.getElementById("main-footer");
        setFooter(footer);

        const scrollListener = e => {
            // If the top of the footer is in the view then update
            if (window.innerHeight - 1 > footer?.getBoundingClientRect().top) {
                setCallCount(old => old + 1);
            };
        };

        document.addEventListener("scroll", scrollListener);

        setIsLoading(true);
        loadMore().finally(() => setIsLoading(false));

        return () => document.removeEventListener("scroll", scrollListener);
    }, []);

    useEffect(() => {            
        // If the top of the footer is in the view then update
        if (
            window.innerHeight - 1 > footer?.getBoundingClientRect().top 
            && !_isLoading
            && hasMore
        ) {
            setIsLoading(true);
            loadMore().finally(() => setIsLoading(false));
        };
    }, [_callCount]);

    return (
        <div>
            {children}
        </div>
    );
};