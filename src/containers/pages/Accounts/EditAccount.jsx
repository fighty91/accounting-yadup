import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from "react-redux";
import Swal from "sweetalert2";
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import InputValidation from "../../../components/atoms/InputValidation";
import FormSubAccount from "../../../components/molecules/SubAccountForm";
import { ButtonLinkTo, ButtonSubmit } from "../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getCategoriesFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalFromAPI, getReceiptJournalFromAPI, putAccountToAPI } from "../../../config/redux/action";
import { checkAccHistory } from "../../organisms/MyFunctions/useAccountFunc";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";

const EditAccount = (props) => {
    const {deleteProps, updateProps} = useGeneralFunc()
    const {accountId} = useParams()
    const navigate = useNavigate()

    const [parentAccounts, setParentAccounts] = useState([])
    const [masterDepreciaton, setMasterDepreciaton] = useState([])
    const [numberAccounts, setNumberAccounts] = useState([])
    const [masterAmortization, setMasterAmortization] = useState([])
    const [account, setAccount] = useState({
        accountName: '',
        number: '',
        categoryId: '',
        balance: '',
        isParent: false,
        isActive: true
    })
    const [accountDb, setAccountDb] = useState()
    const [categories, setCategories] = useState([])
    const [accountType, setAccountType] = useState('subAccount')
    const [accumulationType, setAccumulationType] = useState('')
    const [numberAvailable, setNumberAvailable] = useState(true)
    const [nullValid, setNullValid] = useState({})
    const [mappingRole, setMappingRole] = useState({})
    const [transactions, setTransactions] = useState([])

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1700,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    const getAccGroup = (dataAccountId) => {
        const data = props.accounts
        const newParentAccounts = data.filter(e => e.isParent)

        let amorCategId = ''
        let depreCategId = ''
        props.categories.find(e => {
            if(e.name === 'Intangible Fixed Asset') amorCategId = e.id
            if(e.name === 'Tangible Fixed Asset') depreCategId = e.id
        })
        const newMasterDepreciaton = data.filter(e => e.categoryId === depreCategId && !e.isParent && !e.isDepreciation)
        const newMasterAmortization = data.filter(e => e.categoryId === amorCategId && !e.isParent && !e.isAmortization)

        let numberData = []
        data.forEach(e => numberData.push(e.number))

        let accountDb = dataAccountId && data.find(e => e.id === dataAccountId)
        return {
            newParentAccounts,
            newMasterDepreciaton,
            newMasterAmortization,
            numberData,
            accountDb
        }
    }
    
    // update
    const checkMapping = async(newAccount) => {
        const {isParent, isAmortization, isDepreciation} = newAccount
        const data = {
            account: newAccount,
            contacts: props.contacts,
            accounts: props.accounts,
            transactions
        }
        let checkAccount = await checkAccHistory(data)

        let newMappingRole = {}
        const {childCount, transCount, masterAcc, contactCount} = checkAccount
        if(isParent && childCount > 0) newMappingRole.parentOnly = true
        if(masterAcc > 0 || contactCount > 0) {
            updateProps(newMappingRole, {subOnly: true, fixCategory: true})
            if(masterAcc > 0) newMappingRole.fixParent = true
            if(contactCount > 0) newMappingRole.limitParent = true
        }
        if(transCount > 0) {
            isAmortization || isDepreciation ? newMappingRole.accumOnly = true : newMappingRole.subOnly = true
        }
        setMappingRole(newMappingRole)

        let problemMapping
        for(let x in checkAccount) {
            if(checkAccount[x] > 0) problemMapping = x
        }
        if(problemMapping) return problemMapping
    }

    const getNumberValid = async (data) => {
        let newNullValid = data.newNullValid
        let numberData = []
        props.accounts.forEach(e => numberData.push(e.number))

        let newAvailable = true
        if(numberData.find(e => e === data.number)) {
            newAvailable = false
            if(accountDb) {
                if(accountDb.number === data.number) {
                    newAvailable = true
                }
            }
        }
        setNumberAvailable(newAvailable)
        if (newAvailable === false) newNullValid.number = false
        setNullValid(newNullValid)
        return newAvailable
    }

    const handleEntryNumber = async (event) => {
        const {value} = event.target
        let newNullValid = {...nullValid}
        handleEntryAccount(event)

        let newAvailable = true
        if(numberAccounts.find(e => e === value)) {
            newAvailable = false
            if(accountDb) {
                if(accountDb.number === value) {
                    newAvailable = true
                }
            }
        }
        setNumberAvailable(newAvailable)
        if (newAvailable === false) newNullValid.number = false
        setNullValid(newNullValid)
    }

    const handleEntryAccount = (event) => {
        let {name, value} = event.target
        let newAccount = {...account}
        newAccount[name] = value
        if(name === 'masterId' && value > 0) newAccount.parentId = getParentOfMaster(value)
        setAccount(newAccount)
    }

    const getParentOfMaster = (value) => {
        let masterAccount = [...masterDepreciaton]
        masterAmortization.forEach(e => masterAccount.push(e))
        let parentId = masterAccount.find(e => e.id === value).parentId
        return parentId
    }

    const lostConnection = () => Swal.fire({
        title: 'Offline!',
        text: 'Sorry, your internet connection is lost!!',
        icon: 'warning',
        confirmButtonColor: '#fd7e14'
    })
    const putDataToAPI = async (newAccount) => {
        const res = await props.putAccountToAPI(newAccount)
        if(res) {
            navigate(`/accounts/account-detail/${account.id}?page=profile`)
            const {accountName, number} = account
            Toast.fire({
                icon: 'success',
                title: `Success Update (${number})\n${accountName}`
            })
        }
    }
    const handleUpdateData = async () => {
        const problemMapping = await checkMapping(accountDb)
        let newAccount = {...account}
        if(problemMapping) {
            const {isParent, parentId, isAmortization, isDepreciation, masterId, categoryId} = accountDb
            if(isParent && problemMapping === 'childCount') {
                newAccount.isParent = true
                deleteProps(newAccount, ['isAmortization', 'isDepreciation', 'masterId', 'parentId'])
            }
            if(problemMapping === 'transCount') {
                newAccount.isParent = false
                newAccount.parentId = newAccount.parentId || parentId

                isAmortization || isDepreciation ?
                    updateProps(newAccount, {parentId, masterId}) :
                    deleteProps(newAccount, ['isAmortization', 'isDepreciation', 'masterId'])
                if (isAmortization) {
                    newAccount.isAmortization = true
                    delete newAccount.isDepreciation
                } else if(isDepreciation) {
                    newAccount.isDepreciation = true
                    delete newAccount.isAmortization
                }
            }
            if(problemMapping === 'masterAcc' || problemMapping === 'contactCount') {
                updateProps(newAccount, {isParent, categoryId})
                deleteProps(newAccount, ['isAmortization', 'isDepreciation', 'masterId'])
                if(problemMapping === 'masterAcc') newAccount.parentId = parentId
                if(problemMapping === 'contactCount') {
                    // gunakan kategori id untuk menangkap parent apa aja yang diperkenankan
                    let tempCount = 0
                    const parentGroup = parentAccounts.filter(e => e.categoryId === categoryId)
                    parentGroup.find(e => e.id === newAccount.parentId && tempCount++)
                    if(tempCount < 1) newAccount.parentId = parentId
                }
            }
        }
        putDataToAPI(newAccount)
    }
    const handleSubmit = async () => {
        const {accountName, number, categoryId, balance, parentId, masterId} = account
        let newNullValid = {
            accountName: !accountName && true,
            number: !number && true,
            category: !categoryId && true,
            balance: !balance && true
        }
        if(accountType === 'subAccount') newNullValid.parent = !parentId && true
        if(accountType === 'isAccumulation') {
            !accumulationType ? newNullValid.accumType = true : newNullValid.accumMaster = !masterId && true
        }
        
        let problemCount = 0
        for(let x in newNullValid) newNullValid[x] === true && problemCount++
        
        const data = {number, newNullValid}
        const newNumberAvailable = await getNumberValid(data) // untuk menangkap nomor sudah dipakai atau belum
        !newNumberAvailable && problemCount++

        if(problemCount < 1) {
            window.navigator.onLine ?
            handleUpdateData() : lostConnection()
        }
    }
    const handleKeyEnter = (event) => {
        event.code === 'Enter' && handleSubmit()
    }

    const handleAccountType = async(e) => {
        let newAccount = {...account}
        const typeValue = e.target.value

        switch(typeValue) {
            case 'subAccount':
                deleteProps(newAccount, ['masterId', 'isDepreciation', 'isAmortization']);
                newAccount.isParent = false
                break
            case 'isParent':
                deleteProps (newAccount, ['masterId', 'parentId', 'isDepreciation', 'isAmortization'])
                newAccount[typeValue] = true
                delete newAccount.parentId
                break
            default:
                delete newAccount.parentId
                newAccount.isParent = false
        }
        setAccountType(typeValue)
        setAccumulationType('')
        setAccount(newAccount)
    }

    const handleEntryAccumulation = (e) => {
        let newAccount = {...account}
        delete newAccount[accumulationType]
        delete newAccount.masterId

        let newAccumType = e.target.value
        newAccount[newAccumType] = true
        setAccumulationType(newAccumType)
        setAccount(newAccount)

        if (nullValid.accumMaster) {
            let newNullValid = {...nullValid}
            delete newNullValid.accumMaster
            setNullValid(newNullValid)
        }
    }
        
    const getAccountCollect = async () => {
        const accGroup = await getAccGroup(accountId)
        const {newParentAccounts, newMasterDepreciaton, newMasterAmortization, numberData} = accGroup

        setParentAccounts(newParentAccounts)
        setMasterDepreciaton(newMasterDepreciaton)
        setMasterAmortization(newMasterAmortization)
        setNumberAccounts(numberData)

        checkMapping(accGroup.accountDb)
    }
    const getAccUpdate = async() => {
        let temp = props.accounts
        if(temp.length < 1) temp = await props.getAccountsFromAPI()

        let newAccountDb = temp.find(e => e.id === accountId)
            
        const {isParent, isAmortization, isDepreciation} = newAccountDb
        isParent && setAccountType('isParent')
        if(isAmortization || isDepreciation) setAccountType('isAccumulation')
        isAmortization && setAccumulationType('isAmortization')
        isDepreciation && setAccumulationType('isDepreciation')
        setAccountDb(newAccountDb)
        setAccount(newAccountDb)
    }
    useEffect(() => {
        getAccUpdate()
    }, [])
    useEffect(() => {
        props.accounts.length > 0 && getAccountCollect()
    }, [props.accounts])

    useEffect(() => {
        props.categories.length < 1 && props.getCategoriesFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.categories
        temp.length > 0 && setCategories(temp)
    }, [props.categories])

    const getTransactionsProps = async() => {
        !props.transactions.openingBalance && await props.getOpeningBalanceFromAPI()
        !props.transactions.receiptJournal && await props.getReceiptJournalsFromAPI()
        !props.transactions.paymentJournal && await props.getPaymentJournalsFromAPI()
        !props.transactions.journalEntries && await props.getJournalEntriesFromAPI()
    }
    useEffect(() => {
        props.contacts.length < 1 && props.getContactsFromAPI()
        getTransactionsProps()
    }, [])
    useEffect(() => {
        let temp = []
        for(let x in props.transactions) {
            props.transactions[x].forEach(e => temp.push(e))
        }
        setTransactions(temp)
    }, [props.transactions])
    useEffect(()=> {
        props.accounts.length > 0 && getAccountCollect()
    }, [transactions, props.contacts])

    const handleSubFunc = {handleAccountType, handleEntryAccount, handleEntryAccumulation, handleKeyEnter}
    const dataSub = {accountType, account, parentAccounts, nullValid, accumulationType, masterAmortization, masterDepreciaton, categoryId: accountDb && accountDb.categoryId}
    return(
        <LayoutsMainContent>
            <ContentHeader name={"Edit Account"}/>
            <div className="card">
                <div className="card-body mt-3">
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label htmlFor="accountName" className="">Name</label>
                            <input type="text" className="form-control form-control-sm" id="accountName" placeholder="" name="accountName" autoComplete="off" onChange={handleEntryAccount} value={account.accountName ? account.accountName : ''} onKeyUp={handleKeyEnter}/>
                            {nullValid.accountName && <InputValidation name="name null" />}
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="number" className="">Number</label>
                            <input type="text" className="form-control form-control-sm" id="number" placeholder="" name="number" autoComplete="off" onChange={handleEntryNumber} value={account.number ? account.number : ''} onKeyUp={handleKeyEnter} />
                            {!numberAvailable && <InputValidation name="number unavailable" />}
                            {nullValid.number && <InputValidation name="number null" />}
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="categoryId" className="">Category</label>
                                
                                <select className="form-select form-select-sm" id="categoryId" name="categoryId" onChange={handleEntryAccount} value={account.categoryId && account.categoryId} disabled={mappingRole.fixCategory} >
                                    {!account.categoryId && <option value="">Choose...</option>}
                                    {
                                        mappingRole.fixCategory ?
                                        categories.map(e => e.id === account.categoryId && <option key={e.id} value={e.id}>{e.name}</option>)
                                        :
                                        categories.map(e => <option key={e.id} value={e.id}>{e.name}</option>)
                                    }
                                </select>
                            {nullValid.category && <InputValidation name="category null" />}
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="balance" className="">Balance</label>
                            <select className="form-select form-select-sm" id="balance" name="balance" onChange={handleEntryAccount} value={account.balance} >
                                {!account.balance && <option value="">Choose...</option>}
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                            </select>
                            {nullValid.balance && <InputValidation name="balance null" />}
                        </div>
                    </div>
                    <FormSubAccount handleSubFunc={handleSubFunc} data={dataSub} mappingRole={mappingRole} />
                    <div>
                        <ButtonSubmit color="outline-primary" handleOnClick={handleSubmit} isUpdate={true}/>
                        &nbsp;&nbsp;&nbsp;
                        <ButtonLinkTo color="outline-danger" name="Cancel" linkTo={`/accounts/account-detail/${accountId}?page=profile`} />
                    </div>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    categories: state.categories,
    accounts: state.accounts,
    contacts: state.contacts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getCategoriesFromAPI: () => dispatch(getCategoriesFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    putAccountToAPI: (data) => dispatch(putAccountToAPI(data)),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(EditAccount)