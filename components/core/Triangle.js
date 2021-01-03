import { PIXEL_SIZING } from "../../utils/constants";

export const Triangle = ({ style = {}, className }) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={style.height || PIXEL_SIZING.medium}
            height={style.width || PIXEL_SIZING.medium}
            className={className}
            style={{
                ...style
            }}
            viewBox="0 0 24 24"
        >
            <path 
                d="M23.677 18.52c.914 1.523-.183 3.472-1.967 3.472h-19.414c-1.784 0-2.881-1.949-1.967-3.472l9.709-16.18c.891-1.483 3.041-1.48 3.93 0l9.709 16.18z"
            />
        </svg>
    )
};