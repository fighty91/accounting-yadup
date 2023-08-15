const initialState = {
    corp: 'yadupa',
    isLogin: false,
    authLoading: false,
    logoutLoading: false,

    accounts: [],
    categories: [],
    contacts: [],
    transactions: {},

    notes: []
}
  
const reducer = (state = initialState, action)  => {
    const { type, value } = action
    switch (type) {
        case 'CHANGE_AUTH_LOADING' :
            return {
                ...state,
                authLoading: value
            }
        case 'CHANGE_IS_LOGIN' :
            return {
                ...state,
                isLogin: value
            }
        case 'CHANGE_LOGOUT_LOADING' :
            return {
                ...state,
                logoutLoading: value
            }
        case 'SET_ACCOUNTS' :
            return {
                ...state,
                accounts: value
            }
        case 'SET_CATEGORIES' :
            return {
                ...state,
                categories: value
            }
        case 'SET_CONTACTS' :
            return {
                ...state,
                contacts: value
            }
        case 'SET_ENTRIES' :
            let newTransactions = {...state.transactions}
            newTransactions.journalEntries = value
            return {
                ...state,
                transactions: newTransactions
            }
        case 'SET_NOTES' :
            return {
            ...state,
            notes: value
            }
        default:
            return state
    }
}

export default reducer