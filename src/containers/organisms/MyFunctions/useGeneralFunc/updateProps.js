export const updateProps = (data, props) => {
    for(let x in props) {
        data[x] = props[x]
    }
}