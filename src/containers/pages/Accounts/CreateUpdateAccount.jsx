import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from "react-redux";
import Swal from "sweetalert2";

import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import InputValidation from "../../../components/atoms/InputValidation";
import FormSubAccount from "../../../components/molecules/SubAccountForm";
import { ButtonLinkTo, ButtonSubmit } from "../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getCategoriesFromAPI, getContactsFromAPI, getTransactionsFromAPI, postAccountToAPI, putAccountToAPI } from "../../../config/redux/action";
import { checkAccHistory } from "../../organisms/MyFunctions/useAccountFunc";

import { useAccountFunc, useGeneralFunc } from "../../../utils/MyFunction/MyFunction";

const CreateUpdateAccount = (props) => {
    const { emptyAcc } = useAccountFunc()
    const { deleteProps, updateProps } = useGeneralFunc()
    const {accountId} = useParams()
    const navigate = useNavigate()

    const [parentAccounts, setParentAccounts] = useState([])
    const [masterDepreciaton, setMasterDepreciaton] = useState([])
    const [numberAccounts, setNumberAccounts] = useState([])
    const [masterAmortization, setMasterAmortization] = useState([])
    const [account, setAccount] = useState({})
    const [accountDb, setAccountDb] = useState()
    const [categories, setCategories] = useState([])
    const [accountType, setAccountType] = useState('subAccount')
    const [accumulationType, setAccumulationType] = useState('')
    const [numberAvailable, setNumberAvailable] = useState(true)
    const [nullValid, setNullValid] = useState({})
    const [isUpdate, setIsUpdate] = useState(false)
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
    
    const getAccountCollect = async () => {
        const accGroup = await getAccGroup(accountId)
        const {newParentAccounts, newMasterDepreciaton, newMasterAmortization, numberData} = accGroup

        setParentAccounts(newParentAccounts)
        setMasterDepreciaton(newMasterDepreciaton)
        setMasterAmortization(newMasterAmortization)
        setNumberAccounts(numberData)

        if(accountId) {
            let newAccountDb = {...accGroup.accountDb}
            const { isParent, isAmortization, isDepreciation } = newAccountDb
            isParent && setAccountType('isParent')
            if(isAmortization || isDepreciation) setAccountType('isAccumulation')
            isAmortization && setAccumulationType('isAmortization')
            isDepreciation && setAccumulationType('isDepreciation')
            setAccount(newAccountDb)
            setAccountDb(newAccountDb)
            checkMapping(newAccountDb)
        }
    }

    // update
    const checkMapping = async (newAccount) => {
        const { isParent, isAmortization, isDepreciation} = newAccount
        const data = {
            account: newAccount,
            contacts: props.contacts,
            accounts: props.accounts,
            transactions,
        }
        let checkAccount = accountId && await checkAccHistory(data)

        let newMappingRole = {...mappingRole}
        const { childCount, transCount, masterAcc, contactCount } = checkAccount
        if(isParent && childCount > 0) newMappingRole.parentOnly = true
        if(masterAcc > 0 || contactCount > 0) updateProps(newMappingRole, {subOnly: true, fixParent: true})
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
     
    const postDataToAPI = async () => {
        const id = await props.postAccountToAPI(account)
        if(id) {
            const {accountName, number} = account
            Toast.fire({
                icon: 'success',
                title: `Success Add (${number})\n${accountName}`
            })
            navigate(`/accounts/account-detail/${id}?page=profile`)
        }
    }

    const putDataToAPI = async () => {
        const res = await props.putAccountToAPI(account)
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
        if(problemMapping) {
            let newAccount = {...account}
            const { isParent, parentId, isAmortization, isDepreciation, masterId } = accountDb
            if(isParent && problemMapping === 'childCount') {
                newAccount.isParent = true
                deleteProps(newAccount, ['isAmortization', 'isDepreciation', 'masterId', 'parentId'])
            }
            if(problemMapping === 'transCount') {
                newAccount.isParent = false
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
                updateProps(newAccount, {isParent, parentId})
                deleteProps(newAccount, ['isAmortization', 'isDepreciation', 'masterId'])
            }
            await putDataToAPI(account)
        } else {
            await putDataToAPI(account)
        }
    }

    const getResetForm = () => {
        setAccount(emptyAcc)
    }

    const getNumberValid = async (data) => {
        let newNullValid = data.newNullValid
        let numberData = []
        props.accounts.forEach(e => numberData.push(e.number))

        let newAvailable = true
        if (numberData.find(e => e === data.number)) {
            newAvailable = false
            if(accountDb) {
                if (accountDb.number === data.number) {
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
        const { value } = event.target
        let newNullValid = {...nullValid}
        handleEntryAccount(event)

        let newAvailable = true
        if (numberAccounts.find(e => e === value)) {
            newAvailable = false
            if(accountDb) {
                if (accountDb.number === value) {
                    newAvailable = true
                }
            }
        }
        setNumberAvailable(newAvailable)
        if (newAvailable === false) newNullValid.number = false
        setNullValid(newNullValid)
    }

    const handleEntryAccount = (event) => {
        let { name, value } = event.target
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
            isUpdate ? handleUpdateData() : postDataToAPI()
        }

        problemCount > 1 && console.log('problem detection')
    }

    const handleKeyEnter = (event) => {
        event.code === 'Enter' && handleSubmit()
    }

    const handleAccountType = async (e) => {
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

    const setUpdate = () => {
        setIsUpdate(true)
        props.getContactsFromAPI()
        props.getTransactionsFromAPI()
    }
        
    useEffect(() => {
        !accountId && getResetForm()
        accountId && setUpdate()
        props.getAccountsFromAPI()
        props.getCategoriesFromAPI()
    }, [])
    
    useEffect(() => {
        getAccountCollect()
    }, [props.accounts])

    useEffect(() => {
        setCategories(props.categories)
    }, [props.categories])

    useEffect(() => {
        let temp = []
        for(let x in props.transactions) {
            props.transactions[x].forEach(e => temp.push(e))
        }
        setTransactions(temp)
    }, [props.transactions])
    
    const test = () => {
        // console.log(masterAmortization)
    }

    const handleSubFunc = {handleAccountType, handleEntryAccount, handleEntryAccumulation, handleKeyEnter}
    const dataSub = {accountType, account, parentAccounts, nullValid, accumulationType, masterAmortization, masterDepreciaton}
    return(
        <LayoutsMainContent>
            <ContentHeader name={isUpdate ? "Edit Account" : "New Account"}/>
            <div className="card">
                <div className="card-body mt-3">
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label htmlFor="accountName" className="" onClick={test}>Name</label>
                            <input type="text" className="form-control form-control-sm" id="accountName" placeholder="" name="accountName" autoComplete="off" onChange={handleEntryAccount} value={account.accountName ? account.accountName : ''} onKeyUp={handleKeyEnter}/>
                            { nullValid.accountName && <InputValidation name="name null" /> }
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="number" className="">Number</label>
                            <input type="text" className="form-control form-control-sm" id="number" placeholder="" name="number" autoComplete="off" onChange={handleEntryNumber} value={account.number ? account.number : ''} onKeyUp={handleKeyEnter} />
                            { !numberAvailable && <InputValidation name="number unavailable" /> }
                            { nullValid.number && <InputValidation name="number null" /> }
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="categoryId" className="">Category</label>
                            <select className="form-select form-select-sm" id="categoryId" name="categoryId" onChange={handleEntryAccount} value={account.categoryId && account.categoryId} >
                                { !account.categoryId && <option value="">Choose...</option> }
                                { categories.map(e => <option key={e.id} value={e.id}>{e.name}</option>) }
                            </select>
                            { nullValid.category && <InputValidation name="category null" /> }
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="balance" className="">Balance</label>
                            <select className="form-select form-select-sm" id="balance" name="balance" onChange={handleEntryAccount} value={account.balance} >
                                { !account.balance && <option value="">Choose...</option> }
                                <option value="debit">Debit</option>
                                <option value="credit">Credit</option>
                            </select>
                            { nullValid.balance && <InputValidation name="balance null" /> }
                        </div>
                    </div>

                    <FormSubAccount handleSubFunc={handleSubFunc} data={dataSub} mappingRole={mappingRole} />
                    
                    <div>
                        <ButtonSubmit color="outline-primary" handleOnClick={handleSubmit} isUpdate={isUpdate}/>
                        &nbsp;&nbsp;&nbsp;
                        <ButtonLinkTo color="outline-danger" name="Cancel" linkTo={isUpdate ? `/accounts/account-detail/${accountId}?page=profile` : '/accounts'} />
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
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI()),
    postAccountToAPI: (data) => dispatch(postAccountToAPI(data)),
    putAccountToAPI: (data) => dispatch(putAccountToAPI(data))
})

export default connect(reduxState, reduxDispatch)(CreateUpdateAccount)