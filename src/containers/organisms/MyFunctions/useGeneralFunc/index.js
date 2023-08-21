import { corporation } from "../../../../config/corporation"

export const getCorpNameShow = () => {
    const initialCorp = corporation.name.charAt(0).toUpperCase()
    let corpName = initialCorp + corporation.name.substr(1)
    return corpName
}