import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import { connect } from "react-redux";
import { getAccountsFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";

const SubAccountList = (props) => {
    const { accountId } = useParams()
    const { getCurrencyAbs } = useGeneralFunc()

    const [subAccounts, setSubAccounts] = useState([])
    const [transactions, setTransactions] = useState([])

    const getAccountsAPI = async () => {
        const newAccounts = props.accounts.filter(e => e.parentId === accountId)
        setSubAccounts(newAccounts)
        if(newAccounts.length > 0) {
            props.getTransactionsFromAPI()
        }
    }
    
    const transAmount = (id) => {
        let total = 0
        transactions.forEach(trans => {
            trans.transAccounts.forEach(e => {
                const { debit, credit } = e
                if(e.account === id) {
                    total = balance === 'debit' ? total + debit - credit : total - debit + credit
                } 
            })
        })
        return total
    }
    
    useEffect(() => {
        getAccountsAPI()
    }, [props.accounts])
    
    useEffect(() => {
        let temp = []
        for(let x in props.transactions) {
            props.transactions[x].forEach(e => temp.push(e))
        }
        setTransactions(temp)
    }, [props.transactions])

    useEffect(() => {
        props.getAccountsFromAPI()
    }, [])

    const { account } = props.dataSub
    const { balance } = account
    let totalAmount = 0
    return (
        <div className="table-responsive-sm">
            <table className="table table-striped table-sm table-transaction">
                <thead>
                    <tr>
                        <th scope="col" colSpan={2}>Account</th>
                        <th scope="col" className="text-center">Status</th>
                        <th scope="col" className="text-end">Amount</th>
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
                                        {/* <Link to={`/accounts/account-detail/${acc.id}?page=transactions``} className="account-number ps-0 pe-0 ms-0 me-0"> */}
                                            { number }
                                        {/* </Link> */}
                                    </td>
                                    <td className="ps-2">
                                        <Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">
                                            { accountName }
                                        </Link>
                                    </td>
                                    <td className="text-center"> { isActive === true ? 'active' : 'not active' } </td>
                                        {
                                            amount < 0 ?
                                            <td className="text-end pe-1">{`(${getCurrencyAbs(amount)})`}</td> :
                                            <td className="text-end pe-2">{getCurrencyAbs(amount)}</td>
                                        }
                                    {/* <td className="text-end pe-2">
                                        {
                                            amount < 0 ? `(${getCurrencyAbs(amount)})` : getCurrencyAbs(amount)
                                        }
                                    </td> */}
                                </tr>
                            )
                        })
                    }
                    <tr>
                        <td className="ps-2 fw-bold" colSpan={3}>
                                Total { account.accountName }
                        </td>
                        {
                            totalAmount < 0 ?
                            <td className="text-end fw-bold pe-1">{`(${getCurrencyAbs(totalAmount)})`}</td> :
                            <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalAmount)}</td>
                        }
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const reduxState = (state) => ({
    accounts: state.accounts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI())
})

export default connect(reduxState, reduxDispatch)(SubAccountList)