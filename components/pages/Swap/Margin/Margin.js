import { createContext } from "react"

const MarginContext = createContext();

export const MarginProvider = ({ children }) => {
    return (
        <MarginContext.Provider>
            { children }
        </MarginContext.Provider>
    )
}