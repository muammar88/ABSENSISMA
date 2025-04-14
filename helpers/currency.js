const helper = {}

helper.hideCurrency  = async (price) => {
    if (price.includes(".")) {
        price = price.replace(/\./g, "");
    }
    return Number(price.replace(/[^0-9\.-]+/g, ""));
}


module.exports = helper;