export const getDecThousSepar = () => {
    const decimalSepar = '.'
    const thousandSepar = decimalSepar === '.' ? ',' : '.'
    return {decimalSepar, thousandSepar}
}

export const getDecimal = (decValue) => {
    const { decimalSepar } = getDecThousSepar()
    let decimal = '0'
    if (decValue) decimal = Math.round(Number('0.' + decValue)*100)
    if (decimal.length < 2) decimal = decimal + '0'
    return decimalSepar + decimal
}

export const getNominal = (value) => {
    let {thousandSepar} = getDecThousSepar()
    let nominalAndDecimal = String(value).split('.')
    const [nomValue, decValue] = nominalAndDecimal
    const reverse = nomValue.split('').reverse().join('');
    const threeChar = reverse.match(/\d{1,3}/g);
    const nominal = threeChar.join(thousandSepar).split('').reverse().join('');
    return nominal + getDecimal(decValue)
}

export const getCurrency = (value) => {
    value = +value
    const temp = value && getNominal(value)
    const result = value ? temp : ''
    return result
}

export const getCurrencyAbs = (value) => {
    const result = getNominal(+value) 
    return result
}

export const getNormalNumb = (stringNumb) => {
    // nanti disesuaikan tergantung input type yang sementara adalah number
    const {thousandSepar, decimalSepar} = getDecThousSepar()
    const results = +stringNumb.split(thousandSepar).join('').replace(decimalSepar, '.')
    return results
}