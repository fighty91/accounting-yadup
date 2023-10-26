export const getFullDateNow = () => {
    const year = new Date().getFullYear()
    let month = String(new Date().getMonth() + 1)
    if (month.length < 2) month = '0' + month
    let date = String(new Date().getDate())
    if (date.length < 2) date = '0' + date
    const fullDate = `${year}-${month}-${date}`
    return fullDate
}