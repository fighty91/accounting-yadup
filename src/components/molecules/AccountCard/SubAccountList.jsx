import React, { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import { connect } from "react-redux";
import { getAccountsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../config/redux/action";

const SubAccountList = (props) => {
    const {accountId} = useParams()
    const {getCurrencyAbs} = useGeneralFunc()
    const [subAccounts, setSubAccounts] = useState([])
    const [transactions, setTransactions] = useState([])

    const transAmount = (id) => {
        let total = 0
        transactions.forEach(trans => {
            trans.transAccounts.forEach(e => {
                const {debit, credit} = e
                if(e.account === id) {
                    total = balance === 'debit' ?
                    total + debit - credit : total - debit + credit
                } 
            })
        })
        return total
    }
    
    const getTransactions = async() => {
        let newTrans = [],
        temp1 = props.transactions.openingBalance,
        temp2 = props.transactions.receiptJournal,
        temp3 = props.transactions.paymentJournal,
        temp4 = props.transactions.journalEntries

        if(!temp1) temp1 = await props.getOpeningBalanceFromAPI()
        if(!temp2) temp2 = await props.getReceiptJournalsFromAPI()
        if(!temp3) temp3 = await props.getPaymentJournalsFromAPI()
        if(!temp4) temp4 = await props.getJournalEntriesFromAPI()

        temp2 && temp2.length > 0 && temp2.forEach(e => newTrans.push(e))
        temp3 && temp3.length > 0 && temp3.forEach(e => newTrans.push(e))
        temp4 && temp4.length > 0 && temp4.forEach(e => newTrans.push(e))
        temp1 && temp1.length > 0 && newTrans.unshift(temp1[0])
        setTransactions(newTrans)
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])

    const getAccountsAPI = async () => {
        const newAccounts = props.accounts.filter(e => e.parentId === accountId)
        setSubAccounts(newAccounts)
    }
    useEffect(() => {
        props.accounts.length > 0 && getAccountsAPI() // get api dilakukan induk
    }, [props.accounts])

    const {account} = props.dataSub
    const {balance} = account
    let totalAmount = 0
    return (
        <Fragment>
            {
                subAccounts.length > 0 ?
                <div className="table-responsive-sm">
                    <table className="table table-striped table-sm table-sub-account-list">
                        <thead>
                            <tr>
                                <th scope="col" colSpan={2} className="ps-2">Account</th>
                                <th scope="col" className="text-center">Status</th>
                                <th scope="col" className="text-end pe-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {
                                subAccounts.map(acc => {
                                    const {number, accountName, isActive, id} = acc
                                    const amount = transAmount(id)
                                    totalAmount += amount
                                    return (
                                        <tr key={id}>
                                            <td className="ps-2 pe-0 account-number">
                                                <Link to={`/accounts/account-detail/${acc.id}?page=profile`} className="account-number">
                                                    {number}
                                                </Link>
                                            </td>
                                            <td className="ps-2">
                                                <Link to={`/accounts/account-detail/${acc.id}?page=profile`} className="account-name pe-0 me-0">
                                                    {accountName}
                                                </Link>
                                            </td>
                                            <td className="text-center"> {isActive === true ? 'active' : 'not active'} </td>
                                            {
                                                amount < 0 ?
                                                <td className="text-end pe-1">{`(${getCurrencyAbs(amount)})`}</td>
                                                :
                                                <td className="text-end pe-2">{getCurrencyAbs(amount)}</td>
                                            }
                                        </tr>
                                    )
                                })
                            }
                            {
                                totalAmount < 0 ?
                                <tr>
                                    <td className="ps-2 fw-bold" colSpan={3}>
                                        Total Amount 
                                    </td>
                                    <td className="text-end fw-bold pe-1">{`(${getCurrencyAbs(totalAmount)})`}</td>
                                </tr>
                                :
                                <tr>
                                    <td className="ps-2 fw-bold" colSpan={3}>
                                        {balance === 'credit' ? 'Credit' : 'Debit'} Amount
                                    </td>
                                    <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalAmount)}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                :
                <p className="pt-3">There is no account...</p>
            }
        </Fragment>

    )
}

const reduxState = (state) => ({
    accounts: state.accounts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(SubAccountList)