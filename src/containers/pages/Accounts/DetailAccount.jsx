import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import AccountCard from "../../../components/molecules/AccountCard";
import ProfileAccount from "../../../components/molecules/AccountCard/ProfileAccount";
import TransactionsAccount from "../../../components/molecules/AccountCard/TransactionsAccount";
import SubAccountList from "../../../components/molecules/AccountCard/SubAccountList";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { deleteAccountFromAPI, getAccountsFromAPI, getCategoriesFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI, getTransactionsFromAPI, setActiveAccount } from "../../../config/redux/action";

import { confirmDeleteAccount } from "../../organisms/MyFunctions/useAccountFunc";

const DetailAccount = (props) => {
    let { accountId } = useParams()
    const navigate = useNavigate()
    
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let activePage = searchParams.get('page')
    
    const [navbarActive, setNavbarActive] = useState({})

    const [account, setAccount] = useState()
    const [category, setCategory] = useState()
    const [parent, setParent] = useState()
    const [masterAccum, setMasterAccum] = useState()
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

    const getConfirmDelete = async () => {
        const data = {
            account, 
            transactions,
            contacts: props.contacts,
            accounts: props.accounts,
        }
        const deleteApproval = await confirmDeleteAccount(data)

        let deleteSuccess = false
        if(deleteApproval) {
            deleteSuccess = await props.deleteAccountFromAPI(accountId)
        }
        if(deleteSuccess) {
            Toast.fire({
                icon: 'success',
                title: `Success Delete (${account.number})\n${account.accountName}`
            })
            navigate('/accounts')
        }
    }

    const handleDeleteAccount = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `${account.accountName} will be removed from the list!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                getConfirmDelete()
            }
        })
    }

    

    const handleActiveAccount = (e) => {
        let newAccount = {...account}
        newAccount.isActive = e.target.checked
        setAccount(newAccount)
        putAccountToAPI(newAccount.isActive)
    }

    const putAccountToAPI = async (isActive) => {
        const res = await props.setActiveAccount({accountId, isActive})
        if(res) {
            if(isActive) {
                Toast.fire({
                    icon: 'success',
                    title: 'Account Active'
                })
            } else {
                Toast.fire({
                    icon: 'warning',
                    title: 'Account not Actived'
                })
            }
        }
    }

    const setData = async () => {
        const newAccount = props.accounts.find(e => e.id === accountId)
        setAccount(newAccount)
        const newCategory = await getCategory(newAccount)
        setCategory(newCategory.name)
        
        const newParent = props.accounts.find(e => e.id === newAccount.parentId)
        setParent(newParent)
        const newMasterAccum = props.accounts.find(e => e.id === newAccount.masterId)
        setMasterAccum(newMasterAccum)
    }

    const getCategory = (newAccount) => {
        return new Promise(async (resolve) => {
            if(newAccount !== undefined) {
                const categories = await props.getCategoriesFromAPI()
                const newCategory = categories.find(e => e.id === newAccount.categoryId)
                resolve(newCategory)
            }
        })
    }

    useEffect(() => {
        props.getAccountsFromAPI()
        // props.getContactsFromAPI()
    }, [accountId])
    
    useEffect(() => {
        setData()
    }, [props.accounts])




    // digunakan ketika menghapus data
    const getTransactionsProps = async() => {
        !props.transactions.openingBalance && await props.getOpeningBalanceFromAPI()
        !props.transactions.receiptJournal && await props.getReceiptJournalsFromAPI()
        !props.transactions.paymentJournal && await props.getPaymentJournalsFromAPI()
        !props.transactions.journalEntries && await props.getJournalEntriesFromAPI()
    }
    useEffect(() => {
        // getTransactionsProps()
    }, [])
    const getTransactions = async() => {
        let newTrans = []
        const temp1 = props.transactions.openingBalance
        const temp2 = props.transactions.receiptJournal
        const temp3 = props.transactions.paymentJournal
        const temp4 = props.transactions.journalEntries
        
        temp2 && temp2.length > 0 && temp2.forEach(e => newTrans.push(e))
        temp3 && temp3.length > 0 && temp3.forEach(e => newTrans.push(e))
        temp4 && temp4.length > 0 && temp4.forEach(e => newTrans.push(e))

        temp1 && temp1.length > 0 && temp1.forEach(e => newTrans.unshift(e))
        newTrans.length > 0 && setTransactions(newTrans)
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])

    const handleNavbarActive = () => {
        let newNavbarActive = {...navbarActive}
        let temp = {
            profileActive: 'profile',
            transActive: 'transactions',
            subListActive: 'sub-account-list'
        }
        for(let x in temp) {
            temp[x] === activePage ?
            newNavbarActive[x] = true : delete newNavbarActive[x]
        }
        setNavbarActive(newNavbarActive)
    }
    useEffect(() => {
        handleNavbarActive()
    }, [activePage])
    
    const {profileActive, transActive, subListActive} = navbarActive
    return(
        <LayoutsMainContent>
            <ContentHeader name={ account && account.accountName || 'Loading...' } subName={ account && account.number || 'Loading...'}/>
            <AccountCard navbarActive={navbarActive} dataCard={{accountId, isParent: account && account.isParent}}>
                {
                    profileActive &&
                    <ProfileAccount 
                        handleProfileFunc={{handleActiveAccount, handleDeleteAccount}}
                        dataProfile={{
                            account, 
                            category, 
                            parent, 
                            masterAccum
                        }}
                    />
                }
                {
                    account && 
                    <Fragment>
                        { !account.isParent && transActive && <TransactionsAccount dataTrans={{account}} /> }
                        { account.isParent && subListActive && <SubAccountList dataSub={{account}} /> }
                    </Fragment>
                }
            </AccountCard>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    accounts: state.accounts,
    categories: state.categories,
    transactions: state.transactions,
    contacts: state.contacts
})

const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getCategoriesFromAPI: () => dispatch(getCategoriesFromAPI()),
    setActiveAccount: (data) => dispatch(setActiveAccount(data)),
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI()),
    deleteAccountFromAPI: (data) => dispatch(deleteAccountFromAPI(data)),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI())
})

export default connect(reduxState, reduxDispatch)(DetailAccount)