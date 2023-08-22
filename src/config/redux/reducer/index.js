const initialState = {
    corp: 'yadupa',
    isLogin: false,
    authLoading: false,
    logoutLoading: false,

    user: [],
    users: [],
    userAccess: [],
    accounts: [],
    categories: [],
    contacts: [],
    transactions: {},
    identicalCode: [],
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
        case 'SET_TRANSACTIONS' :
            return {
                ...state,
                transactions: value
            }
        case 'SET_PAYMENT_JOURNAL' :
            let paymentJournalTransactions = {
                ...state.transactions,
                paymentJournal: value
            }
            return {
                ...state,
                transactions: paymentJournalTransactions
            }
        case 'SET_ENTRIES' :
            let entriesTransactions = {
                ...state.transactions,
                journalEntries: value
            }
            return {
                ...state,
                transactions: entriesTransactions
            }
        case 'SET_IDENTICAL_CODE' :
            return {
                ...state,
                identicalCode: value
            }
        case 'SET_USER' :
            return {
                ...state,
                user: value
            }
        case 'SET_USERS' :
            return {
                ...state,
                users: value
            }
        case 'SET_USERACCESS' :
            return {
                ...state,
                userAccess: value
            }
        default:
            return state
    }
}

export default reducer