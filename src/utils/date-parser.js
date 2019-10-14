const parseDate = (date) => {
    let data = date.split("-");
    return data[2] + "/" + data[1] + "/" + data[0];
}

export default parseDate;