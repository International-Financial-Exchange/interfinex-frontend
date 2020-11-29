import { ethers, BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

export const sizingToInt = size => {
    return parseInt(size.slice(0, size.length - 2));
};

export const hasAllowance = allowance => allowance.gte(ethers.constants.MaxUint256.div(BigNumber.from('100')));

export const isZeroAddress = address => 
    address === ethers.constants.AddressZero;

Array.prototype.first = function() {
    return this[0] != null ? JSON.parse(JSON.stringify(this[0])) : this[0];
};

Array.prototype.last = function() {
    return this[this.length - 1] != null ? JSON.parse(JSON.stringify(this[this.length - 1])) : this[this.length - 1];
};

const hex2 = c => {
    c = Math.round(c);
    if (c < 0) c = 0;
    if (c > 255) c = 255;
    var s = c.toString(16);
    if (s.length < 2) s = "0" + s;
    return s;
}

const color = (r, g, b) => {
    return "#" + hex2(r) + hex2(g) + hex2(b);
}

export const shade = (col, light)=> {
    var r = parseInt(col.substr(1, 2), 16);
    var g = parseInt(col.substr(3, 2), 16);
    var b = parseInt(col.substr(5, 2), 16);
    if (light < 0) {
        r = (1 + light) * r;
        g = (1 + light) * g;
        b = (1 + light) * b;
    } else {
        r = (1 - light) * r + light * 255;
        g = (1 - light) * g + light * 255;
        b = (1 - light) * b + light * 255;
    }

    return color(r, g, b);
}

export const parseTokenAmount = (amount, token) => {
    return ethers.utils.parseUnits(amount.toFixed(token.decimals), token.decimals).toString();
};

export const safeParseEther = amount => parseEther(parseFloat(amount).toFixed(18));

export const humanizeTokenAmount = (amount, token) => parseFloat(ethers.utils.formatUnits(amount.toString(), token.decimals));