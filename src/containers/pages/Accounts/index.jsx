import React, { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getAccountsFromAPI, getCategoriesFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../config/redux/action";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import './Accounts.scss'

const Accounts = (props) => {
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const { getCurrencyAbs } = useGeneralFunc()

    const transAmount = (accountId) => {
        let parentAmount = 0
        let childAccounts = accounts.filter(e => e.parentId === accountId)

        childAccounts.forEach(acc => {
            let amount = 0
            transactions.forEach((trans, i) => {
                trans.transAccounts.forEach(e => {
                    if(e.account === acc.id) amount = amount + e.debit - e.credit
                })
            })
            acc.amount = amount
            parentAmount += amount
            const category = categories.find(e => e.id === acc.categoryId)
            acc.categoryName = category && category.name
        })
        return { childAccounts, parentAmount }
    }

    const setAccountsFromProps = () => {
        const newParentAccounts = props.accounts.filter(e => e.isParent)
        setParentAccounts(newParentAccounts)
        const newAccounts = props.accounts.filter(e => !e.isParent)
        setAccounts(newAccounts)
    }
    useEffect(() => {
        props.accounts.length === 0 && props.getAccountsFromAPI()
    }, [])
    useEffect(() => {
        props.accounts.length > 0 && setAccountsFromProps()
    }, [props.accounts])
    
    useEffect(() => {
        props.categories.length === 0 && props.getCategoriesFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.categories
        temp.length > 0 && setCategories(temp)
    }, [props.categories])
    
    const getTransactionsCheck = async() => {
        !props.transactions.openingBalance && await props.getOpeningBalanceFromAPI()
        !props.transactions.paymentJournal && await props.getPaymentJournalsFromAPI()
        !props.transactions.receiptJournal && await props.getReceiptJournalsFromAPI()
        !props.transactions.journalEntries && await props.getJournalEntriesFromAPI()
    }
    useEffect(() => {
        getTransactionsCheck()
    }, [])
    const getTransactions = async() => {
        let trans = []

        const temp1 = props.transactions.openingBalance
        temp1 && temp1.length > 0 && temp1.forEach(e => trans.push(e))
        
        const temp2 = props.transactions.paymentJournal
        temp2 && temp2.length > 0 && temp2.forEach(e => trans.push(e))
        
        const temp3 = props.transactions.receiptJournal
        temp3 && temp3.length > 0 && temp3.forEach(e => trans.push(e))
        
        const temp4 = props.transactions.journalEntries
        temp4 && temp4.length > 0 && temp4.forEach(e => trans.push(e))

        trans.length > 0 && setTransactions(trans)
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])

    return (
        <Fragment>
            <LayoutsMainContent>
                    <ContentHeader name="Chart of Accounts"/>
                    {/* Entry Content */}
                    <div className="mb-4">
                        <Link to="new-account" className="btn btn-secondary btn-sm">New Account</Link>
                    </div>
                    <div className="card pb-4">
                        <div className="card-body">
                            {
                                accounts.length > 0 ?
                                <div className="table-responsive-sm scrollarea">
                                    <table className="table table-striped table-sm table-transaction">
                                        <thead>
                                            <tr>
                                                <th scope="col" colSpan={2}>Account</th>
                                                <th scope="col" className="text-start"></th>
                                                <th scope="col" className="text-center"></th>
                                                <th scope="col" className="text-end">Debit (Credit)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-group-divider">
                                            {
                                                parentAccounts.map((parentAccount, i) => {
                                                    let { id, number, accountName, isActive, categoryId } = parentAccount
                                                    const {childAccounts, parentAmount} = transAmount(id)
                                                    const category = categories.find(e => e.id === categoryId)
                                                    const categoryName = category && category.name
                                                    return (
                                                        <Fragment key={id}>
                                                            <tr>
                                                                <td className="fw-bold ps-0 pe-0 account-number"><Link to={`account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                                <td className="fw-bold ps-0"><Link to={`account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                                <td className="text-start fw-bold">{categoryName}</td>
                                                                <td className="text-center fw-bold"> { isActive === true ? 'active' : 'not active' } </td>
                                                                {
                                                                    parentAmount < 0 ?
                                                                    <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(parentAmount)})`}</td>
                                                                    :
                                                                    <td className="text-end fw-bold pe-2">{getCurrencyAbs(parentAmount)}</td>

                                                                }
                                                            </tr>
                                                            {
                                                                childAccounts.map(acc => {
                                                                    return (
                                                                        <tr key={acc.id}>
                                                                            <td className="ps-2 pe-0 me-0 account-number"><Link to={`account-detail/${acc.id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                            <td className="ps-2 ps-0 ms-0"><Link to={`account-detail/${acc.id}?page=profile`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                            <td className="text-start">{acc.categoryName}</td>
                                                                            <td className="text-center"> { acc.isActive === true ? 'active' : 'not active' } </td>
                                                                            {
                                                                                acc.amount < 0 ?
                                                                                <td className="text-end pe-1">
                                                                                    {`(${getCurrencyAbs(acc.amount)})`}
                                                                                </td> :
                                                                                <td className="text-end pe-2">{getCurrencyAbs(acc.amount)}</td>
                                                                            }
                                                                        </tr>
                                                                    )
                                                                })
                                                            }
                                                        </Fragment>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                :
                                <p>There is no account...</p>
                            }
                        </div>

                    </div>
            </LayoutsMainContent>
        </Fragment>
    )
}

const reduxState = (state) => ({
    accounts: state.accounts,
    categories: state.categories,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getCategoriesFromAPI: () => dispatch(getCategoriesFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI())
})

export default connect(reduxState, reduxDispatch)(Accounts)