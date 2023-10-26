export const deleteProps = (data, props) => {
    for(let p of props) {
        delete data[p]
    }
}