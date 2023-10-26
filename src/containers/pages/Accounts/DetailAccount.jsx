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
import { deleteAccountFromAPI, getAccountsFromAPI, getCategoriesFromAPI, getClosingJournalsFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI, setActiveAccount } from "../../../config/redux/action";
import { confirmDeleteAccount } from "../../organisms/MyFunctions/useAccountFunc";
import { ToastAlert, lostConnection } from "../../organisms/MyFunctions/useGeneralFunc";

const DetailAccount = (props) => {
    let {accountId} = useParams()
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let activePage = searchParams.get('page')
    
    const [navbarActive, setNavbarActive] = useState({})
    const [account, setAccount] = useState({isActive: false})
    const [category, setCategory] = useState()
    const [parent, setParent] = useState()
    const [masterAccum, setMasterAccum] = useState()
    const [dataReady, setDataReady] = useState(false)

    // const Toast = Swal.mixin({
    //     toast: true,
    //     position: 'top-end',
    //     showConfirmButton: false,
    //     timer: 1700,
    //     timerProgressBar: true,
    //     didOpen: (toast) => {
    //       toast.addEventListener('mouseenter', Swal.stopTimer)
    //       toast.addEventListener('mouseleave', Swal.resumeTimer)
    //     }
    // })

    // const lostConnection = () => Swal.fire({
    //     title: 'Offline!',
    //     text: 'Sorry, your internet connection is lost!!',
    //     icon: 'warning',
    //     confirmButtonColor: '#fd7e14'
    // })

    const getContacts = async() => {
        let temp = props.contacts
        if(temp.length === 0) temp = await props.getContactsFromAPI()
        return temp
    }
    const getTransactions = async() => {
        let newTrans = [],
        temp1 = props.transactions.openingBalance,
        temp2 = props.transactions.receiptJournal,
        temp3 = props.transactions.paymentJournal,
        temp4 = props.transactions.journalEntries,
        temp5 = props.transactions.closingJournal

        if(!temp1) temp1 = await props.getOpeningBalanceFromAPI()
        if(!temp2) temp2 = await props.getReceiptJournalsFromAPI()
        if(!temp3) temp3 = await props.getPaymentJournalsFromAPI()
        if(!temp4) temp4 = await props.getJournalEntriesFromAPI()
        if(!temp5) temp5 = await props.getClosingJournalsFromAPI()

        temp2 && temp2.length > 0 && temp2.forEach(e => newTrans.push(e))
        temp3 && temp3.length > 0 && temp3.forEach(e => newTrans.push(e))
        temp4 && temp4.length > 0 && temp4.forEach(e => newTrans.push(e))
        temp5 && temp5.length > 0 && temp5.forEach(e => newTrans.push(e))
        temp1 && temp1.length > 0 && newTrans.unshift(temp1[0])
        return newTrans
    }
    const getConfirmDelete = async () => {
        if(window.navigator.onLine) {
            const transactions = await getTransactions(),
            contacts = await getContacts(),
            data = {
                account, transactions, contacts,
                accounts: props.accounts,
            }
            const deleteApproval = await confirmDeleteAccount(data)

            let deleteSuccess = false
            if(deleteApproval) deleteSuccess = await props.deleteAccountFromAPI(accountId)
            if(deleteSuccess) {
                navigate('/accounts')
                ToastAlert.fire({
                    icon: 'success',
                    title: `Success Delete (${account.number})\n${account.accountName}`
                })
            }
        }
        else lostConnection()
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
            if(result.isConfirmed) {
                getConfirmDelete()
            }
        })
    }
    
    const putActiveAccount = async (isActive) => {
        const res = await props.setActiveAccount({accountId, isActive})
        if(res) {
            isActive ?
            ToastAlert.fire({
                icon: 'success',
                title: 'Account Active'
            })
            :
            ToastAlert.fire({
                icon: 'warning',
                title: 'Account not Actived'
            })
        }
    }
    const handleActiveAccount = (e) => {
        window.navigator.onLine ?
        putActiveAccount(e.target.checked) : lostConnection()
    }

    const handleNavbarActive = () => {
        let newNavbarActive = {...navbarActive},
        temp = {
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

    const getCategory = (newAccount) => {
        return new Promise(async (resolve) => {
            let temp = props.categories
            if(temp.length === 0) temp = await props.getCategoriesFromAPI()
            const newCategory = await temp.find(e => e.id === newAccount.categoryId)
            resolve(newCategory)
        })
    }
    const setData = async () => {
        const temp = props.accounts
        let newAccount,
        tempAccounts = temp.length > 0 ? temp : await props.getAccountsFromAPI()
        
        if(tempAccounts.length > 0) newAccount = await tempAccounts.find(e => e.id === accountId)
        if(newAccount) {
            const newParent = await tempAccounts.find(e => e.id === newAccount.parentId),
            newMasterAccum = await tempAccounts.find(e => e.id === newAccount.masterId),
            newCategory = await getCategory(newAccount)
            
            setAccount(newAccount)
            setParent(newParent)
            setMasterAccum(newMasterAccum)
            setCategory(newCategory.name)
            setDataReady(true)
        }
        else if(!dataReady) {
            navigate('/accounts')
            Swal.fire({
                title: 'No Available!',
                text: 'You are trying to access unavailable data',
                icon: 'warning',
                confirmButtonColor: '#fd7e14'
            })
        }
    }
    useEffect(() => {
        setData()
    }, [props.accounts, accountId])

    const {profileActive, transActive, subListActive} = navbarActive
    return(
        <LayoutsMainContent>
            <ContentHeader name={account && account.accountName || 'Loading...' } subName={account && account.number || 'Loading...'}/>
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
                        {!account.isParent && transActive && <TransactionsAccount dataTrans={{account}} />}
                        {account.isParent && subListActive && <SubAccountList dataSub={{account}} />}
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
    deleteAccountFromAPI: (data) => dispatch(deleteAccountFromAPI(data)),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getClosingJournalsFromAPI: () => dispatch(getClosingJournalsFromAPI()),
})

export default connect(reduxState, reduxDispatch)(DetailAccount)