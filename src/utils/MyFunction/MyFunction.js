import axios from "axios"

export const useAccountFunc = () => {
    const emptyAcc = {
        accountName: '',
        number: '',
        categoryId: '',
        balance: '',
        isParent: false,
        isActive: true
    }

    const postAccountAPI = async (account) => {
        let data = {}
        await axios.post('http://localhost:3004/accounts', account)
        .then((res) => {
            data = res.data
        }, (err) => {
            console.log(err)
        })
        return data
    }

    const getAccountsAPI = async () => {
        let newAccounts = []
        await axios.get('http://localhost:3004/accounts?_sort=number&_order=asc')
        .then((res) => newAccounts = res.data)
        return newAccounts
    }
    
    // cek apakah bisa dihapus karena digunakan di getAccGroup 
    const getNumberAccounts = async () => {
        const data = await getAccountsAPI()
        let numberData = []
        data.forEach(e => numberData.push(e.number))
        return numberData
    }
    
    const getAccGroup = async (accountId) => {
        const data = await getAccountsAPI()
        const newAccounts = data.filter(e => !e.isParent)
        const newParentAccounts = data.filter(e => e.isParent)
        const newMasterDepreciaton = data.filter(e => e.categoryId === 4 && !e.isParent && !e.isDepreciation) // nanti disesuaikan menjadi 5 karena ada kategory harta tidak berwujud
        const newMasterAmortization = data.filter(e => e.categoryId === 3 && !e.isParent && !e.isAmortization)
        let numberData = []
        data.forEach(e => numberData.push(e.number))

        const newParentCurrentAssets = newParentAccounts.filter(e => e.categoryId <= 3)
        const newParentNonCurrentAssets = newParentAccounts.filter(e => e.categoryId >= 4 && e.categoryId <= 5)
        const newParentLiabilities = newParentAccounts.filter(e => e.categoryId === 6)
        const newParentEquity = newParentAccounts.filter(e => e.categoryId === 7)
        const newParentIncomeExpense = newParentAccounts.filter(e => e.categoryId >= 8)

        let accountDb = accountId && data.find(e => e.id === +accountId)

        return {
            newAccounts,
            newParentAccounts,
            newParentCurrentAssets,
            newParentNonCurrentAssets,
            newParentLiabilities,
            newParentEquity,
            newParentIncomeExpense,
            newMasterDepreciaton,
            newMasterAmortization,
            numberData,
            accountDb
        }
    }

    const deleteAccount = async (accountId) => {
        let deleteSuccess = false
        await axios.delete(`http://localhost:3004/accounts/${accountId}`)
        .then(() => {
            deleteSuccess = true
        }, (err) => console.log(err))
        return deleteSuccess
    }

    const confirmDeleteAccount = async (account) => {
        const { id } = account
        const { transCount, childCount, masterAcc, contactCount } = await checkAccHistory(account)
        let deleteSuccess = false
        if (transCount < 1 && childCount < 1 && masterAcc < 1 && contactCount < 1) {
            deleteSuccess = await deleteAccount(id)
        } else {
            transCount > 0 && alert('Tidak dapat dihapus, sudah ada transaksi pada akun ini')
            childCount > 0 && alert('Tidak dapat dihapus, akun ini memiliki sub akun!!')
            masterAcc > 0 && alert('Tidak dapat dihapus, akun ini memiliki akun depresiasi / amortisasi!!')
            contactCount > 0 && alert('Tidak dapat dihapus, akun ini digunakan pada mapping contact')
        }
        return deleteSuccess
    }
    
    const checkAccHistory = async ({ id, isParent }) => {
        let transCount = 0
        await axios.get('http://localhost:3004/transactions')
        .then((res) => {
            const {data} = res
            data.forEach(e => {
                e.transAccounts.find(a => a.account === id) && transCount++
            })
        })
        const accounts = await getAccountsAPI()
        let childCount = 0
        isParent && accounts.find(e => e.parentId === id) && childCount++
        
        let masterAcc = 0
        accounts.find(e => e.masterId === id) && masterAcc++
        
        let contactCount = 0
        await axios.get('http://localhost:3004/contacts')
        .then((res) => {
            const {data} = res
            const contact = data.find(e => {
                const { expensePayable, accountPayable, accountReceivable } = e.defaultAccount
                return expensePayable === id || accountPayable === id || accountReceivable === id 
            })
            contact && contactCount++
        })
        return { childCount, transCount, masterAcc, contactCount }
    }

    return {
        emptyAcc,
        postAccountAPI,
        getAccountsAPI,
        getNumberAccounts,
        getAccGroup,
        confirmDeleteAccount,
        checkAccHistory
    }
}

export const useContactFunc = () => {
    const getContactsAPI = async () => {
        let newContacts = []
        await axios.get('http://localhost:3004/contacts?_sort=name&_order=asc')
        .then((res) => newContacts = res.data)
        return newContacts
    }
    
    const getContactsActive = async () => {
        let newContacts = []
        await axios.get('http://localhost:3004/contacts?_sort=name&_order=asc', {
            params: { isActive: true }
        })
        .then((res) => newContacts = res.data)
        return newContacts
    }

    const getContactAPI = async (contactId) => {
        let newContact = {}
        await axios.get(`http://localhost:3004/contacts/${contactId}`)
        .then((res) => newContact = res.data)
        return newContact
    }

    return { getContactsAPI, getContactAPI, getContactsActive }
}

export const useJournalEntriesFunc = () => {
    const getEntriesAPI = async () => {
        let newTransactions = []
        let newTransNumbers = []
        await axios.get('http://localhost:3004/transactions?_sort=id&_order=desc', {
            params: { transType: "Journal Entries" }
        })
        .then((res) => newTransactions = res.data)
        newTransactions.forEach(e => newTransNumbers.push(e.transNumber))
        return { newTransactions, newTransNumbers }
    }

    const getEntriesTransaction = async (transId) => {
        let newTransaction = {}
        await axios.get(`http://localhost:3004/transactions/${transId}`, {
            params: {transType: "Journal Entries"}
        })
        .then((res) => newTransaction = res.data)
        return newTransaction
    }

    const postEntriesAPI = async (newTransaction) => {
        let data = {}
        await axios.post('http://localhost:3004/transactions', newTransaction)
        .then((res) => {
            data = res.data
        }, (err) => console.log('error:', err))
        return data
    }
    
    const putEntriesAPI = async (newTransaction) => {
        let data = {}
        await axios.put(`http://localhost:3004/transactions/${newTransaction.id}`, newTransaction)
        .then((res) => {
            data = res.data
        }, (err) => console.log('error:', err))
        return data
    }

    const deleteEntries = async (transId) => {
        let deleteSucces = false
        await axios.delete(`http://localhost:3004/transactions/${transId}`)
        .then(() => {
            deleteSucces = true
        }, (err) => console.log(err))
        return deleteSucces
    }

    return {
        getEntriesAPI,
        getEntriesTransaction,
        postEntriesAPI,
        putEntriesAPI,
        deleteEntries
    }
}


export const useIdenticalFunc = () => {
    const getIdenticalCode = async() => {
        let newIdentical = {}
        await axios.get('http://localhost:3004/identicalCode', {
            params: { codeFor: "Journal Entries" }
        })
        .then((result) => newIdentical = result.data[0])
        return newIdentical
    }

    const putIdenticalAPI = async (data) => {
        axios.put(`http://localhost:3004/identicalCode/${data.id}`, data)
        .then(() => {
            console.log('Identical code updated')
        }, (err) => console.log('error:', err))
    }

    return { getIdenticalCode, putIdenticalAPI }
}

export const useGeneralFunc = () => {
    const getTransAPI = async () => {
        let transactions = []
        await axios.get('http://localhost:3004/transactions?_sort=id&_order=desc')
        .then((res) => transactions = res.data)
        return transactions
    }

    const getTransASC = async () => {
        let transactions = []
        await axios.get('http://localhost:3004/transactions?_sort=date&_order=asc')
        .then((res) => transactions = res.data)
        return transactions
    }
    
    const getDecThousSepar = () => {
        const decimalSepar = '.'
        const thousandSepar = decimalSepar === '.' ? ',' : '.'
        return {decimalSepar, thousandSepar}
    }

    const getDecimal = (decValue) => {
        const { decimalSepar } = getDecThousSepar()
        let decimal = '0'
        if (decValue) decimal = Math.round(Number('0.' + decValue)*100)
        if (decimal.length < 2) decimal = decimal + '0'
        return decimalSepar + decimal
    }

    const getNominal = (value) => {
        let {thousandSepar} = getDecThousSepar()
        let nominalAndDecimal = String(value).split('.')
        const [nomValue, decValue] = nominalAndDecimal
        const reverse = nomValue.split('').reverse().join('');
        const threeChar = reverse.match(/\d{1,3}/g);
        const nominal = threeChar.join(thousandSepar).split('').reverse().join('');
        return nominal + getDecimal(decValue)
    }

    const getCurrency = (value) => {
        value = +value
        const temp = value && getNominal(value)
            // const {decimalSepar, thousandSepar} = getDecThousSepar()
            // const numberValue = +temp.split(thousandSepar).join('').replace(decimalSepar, '.')
        const result = value ? temp : ''
            // result = numberValue !== 0 ? temp : ''
        // }
        return result
    }

    const getCurrencyAbs = (value) => {
        const result = getNominal(+value) 
        return result
    }

    const getNormalNumb = (stringNumb) => {
        // nanti disesuaikan tergantung input type yang sementara adalah number
        const {thousandSepar, decimalSepar} = getDecThousSepar()
        const results = +stringNumb.split(thousandSepar).join('').replace(decimalSepar, '.')
        return results
    }

    const getFullDateNow = () => {
        const year = new Date().getFullYear()
        let month = String(new Date().getMonth() + 1)
        if (month.length < 2) month = '0' + month
        let date = String(new Date().getDate())
        if (date.length < 2) date = '0' + date
        const fullDate = `${year}-${month}-${date}`
        return fullDate
    }

    const deleteProps = (data, props) => {
        for (let p of props) { delete data[p] }
    }

    const updateProps = (data, props) => {
        for ( let x in props) { data[x] = props[x] }
    }

    return {
        getTransAPI,
        getTransASC,
        getCurrency,
        getCurrencyAbs,
        getNormalNumb,
        getDecThousSepar,
        getFullDateNow,
        deleteProps,
        updateProps
    }
}

export {
    // useAccountFunc,
    // useJournalEntriesFunc,
    // useContactFunc,
    // useGeneralFunc,
    // useIdenticalFunc
}