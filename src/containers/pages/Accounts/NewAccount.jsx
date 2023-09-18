import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from "react-redux";
import Swal from "sweetalert2";
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import InputValidation from "../../../components/atoms/InputValidation";
import FormSubAccount from "../../../components/molecules/SubAccountForm";
import { ButtonLinkTo, ButtonSubmit } from "../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getCategoriesFromAPI, postAccountToAPI } from "../../../config/redux/action";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";

const NewAccount = (props) => {
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
    const [categories, setCategories] = useState([])
    const [accountType, setAccountType] = useState('subAccount')
    const [accumulationType, setAccumulationType] = useState('')
    const [numberAvailable, setNumberAvailable] = useState(true)
    const [nullValid, setNullValid] = useState({})
    const [submitLoading, setSubmitLoading] = useState(false)
    
    const {deleteProps} = useGeneralFunc()
    const navigate = useNavigate()

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

    const getAccGroup = () => {
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

        return {
            newParentAccounts,
            newMasterDepreciaton,
            newMasterAmortization,
            numberData
        }
    }
    
    const getNumberValid = async(data) => {
        let newNullValid = data.newNullValid
        let numberData = []
        props.accounts.forEach(e => numberData.push(e.number))

        let newAvailable = true
        await numberData.find(e => e === data.number && (newAvailable = false))
        setNumberAvailable(newAvailable)
        if(newAvailable === false) newNullValid.number = false
        setNullValid(newNullValid)
        return newAvailable
    }

    const handleEntryNumber = async(event) => {
        const {value} = event.target
        let newNullValid = {...nullValid}
        handleEntryAccount(event)

        let newAvailable = true
        numberAccounts.find(e => e === value && (newAvailable = false))
        setNumberAvailable(newAvailable)
        if(newAvailable === false) newNullValid.number = false
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
    const postDataToAPI = async() => {
        const id = await props.postAccountToAPI(account)
        if(id) {
            const {accountName, number} = account
            Toast.fire({
                icon: 'success',
                title: `Success Add (${number})\n${accountName}`
            })
            navigate(`/accounts/account-detail/${id}?page=profile`)
        }
        setSubmitLoading(false)
    }
    const handleSubmit = async() => {
        !window.navigator.onLine && lostConnection()
        if(!submitLoading && window.navigator.onLine) {
            setSubmitLoading(true)
            const {accountName, number, categoryId, balance, parentId, masterId} = account
            let newNullValid = {
                accountName: !accountName && true,
                number: !number && true,
                category: !categoryId && true,
                balance: !balance && true
            }
            if(accountType === 'subAccount') newNullValid.parent = !parentId && true
            if(accountType === 'isAccumulation') {
                !accumulationType ?
                newNullValid.accumType = true : newNullValid.accumMaster = !masterId && true
            }
            let problemCount = 0
            for(let x in newNullValid) newNullValid[x] === true && problemCount++
            
            const data = {number, newNullValid}
            const newNumberAvailable = await getNumberValid(data) // untuk menangkap nomor sudah dipakai atau belum
            !newNumberAvailable && problemCount++
    
            problemCount > 0 ?
            setSubmitLoading(false) : postDataToAPI()
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
        
    const getAccountCollect = async() => {
        const accGroup = await getAccGroup()
        const {newParentAccounts, newMasterDepreciaton, newMasterAmortization, numberData} = accGroup
        setParentAccounts(newParentAccounts)
        setMasterDepreciaton(newMasterDepreciaton)
        setMasterAmortization(newMasterAmortization)
        setNumberAccounts(numberData)
    }
    useEffect(() => {
        props.accounts.length < 1 && props.getAccountsFromAPI()
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

    const handleSubFunc = {handleAccountType, handleEntryAccount, handleEntryAccumulation, handleKeyEnter}
    const dataSub = {accountType, account, parentAccounts, nullValid, accumulationType, masterAmortization, masterDepreciaton}
    return(
        <LayoutsMainContent>
            <ContentHeader name={"New Account"}/>
            <div className="card">
                <div className="card-body mt-3">
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label htmlFor="accountName" className="" >Name</label>
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
                            <select className="form-select form-select-sm" id="categoryId" name="categoryId" onChange={handleEntryAccount} value={account.categoryId && account.categoryId} >
                                {!account.categoryId && <option value="">Choose...</option>}
                                {categories.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
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
                    <FormSubAccount handleSubFunc={handleSubFunc} data={dataSub} />
                    <div>
                        {
                            submitLoading ?
                            <ButtonSubmit color="outline-primary" name="Loading..." />
                            :
                            <ButtonSubmit color="outline-primary" handleOnClick={handleSubmit} />
                        }
                        &nbsp;&nbsp;&nbsp;
                        <ButtonLinkTo color="outline-danger" name="Cancel" linkTo='/accounts' />
                    </div>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    categories: state.categories,
    accounts: state.accounts,
})
const reduxDispatch = (dispatch) => ({
    getCategoriesFromAPI: () => dispatch(getCategoriesFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    postAccountToAPI: (data) => dispatch(postAccountToAPI(data)),
})

export default connect(reduxState, reduxDispatch)(NewAccount)