const initialState = {
    corp: 'yadupa', // cek kembali
    isLogin: false,
    authLoading: false,
    logoutLoading: false,

    user: {},
    users: [],
    userAccess: [],
    accounts: [],
    categories: [],
    contacts: [],
    mappingAccounts: {},
    transactions: {},
    identicalCode: {},
    nLReceiptJournal: {},
    nLPaymentJournal: {},
    nLJournalEntries: {},
    nLClosingJournal: {},
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
        case 'SET_MAPPING_ACCOUNTS' :
            return {
                ...state,
                mappingAccounts: value
            }
        case 'SET_TRANSACTIONS' :
            return {
                ...state,
                transactions: value
            }
        case 'SET_RECEIPT_JOURNAL' :
            let receiptJournalTransactions = {
                ...state.transactions,
                receiptJournal: value
            }
            return {
                ...state,
                transactions: receiptJournalTransactions
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
        case 'SET_CLOSING_JOURNAL' :
            let closingTransactions = {
                ...state.transactions,
                closingJournal: value
            }
            return {
                ...state,
                transactions: closingTransactions
            }
        case 'SET_OPENING_BALANCE' :
            let openingBalanceTransactions = {
                ...state.transactions,
                openingBalance: value
            }
            return {
                ...state,
                transactions: openingBalanceTransactions
            }
        case 'SET_IDENTICAL_CODE' :
            return {
                ...state,
                identicalCode: value
            }
        case 'SET_NUMBER_LIST_RECEIPT_JOURNAL' :
            return {
                ...state,
                nLReceiptJournal: value
            }
        case 'SET_NUMBER_LIST_PAYMENT_JOURNAL' :
            return {
                ...state,
                nLPaymentJournal: value
            }
        case 'SET_NUMBER_LIST_JOURNAL_ENTRIES' :
            return {
                ...state,
                nLJournalEntries: value
            }
        case 'SET_NUMBER_LIST_CLOSING_JOURNAL' :
            return {
                ...state,
                nLClosingJournal: value
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