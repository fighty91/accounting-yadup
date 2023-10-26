import { corporation } from "../../../../config/corporation"

export * from './deleteProps'
export * from './updateProps'
export * from './getNumberFormat'
export * from './getFullDate'
export * from './setAlert'

export const getCorpNameShow = () => {
    const initialCorp = corporation.name.charAt(0).toUpperCase()
    let corpName = initialCorp + corporation.name.substr(1)
    return corpName
}