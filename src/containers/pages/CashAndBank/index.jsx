import React, { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getAccountsFromAPI, getCategoriesFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";
import './CashAndBank.scss'

import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";

const CashAndBank = (props) => {
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])

    const { getCurrencyAbs } = useGeneralFunc()
    
    const getDataAPI = () => {
        props.getAccountsFromAPI()
        props.getCategoriesFromAPI()
        props.getTransactionsFromAPI()
    }

    const setAccountsFromProps = () => {
        const newParentAccounts = props.accounts.filter(e => e.isParent)
        setParentAccounts(newParentAccounts)
        const newAccounts = props.accounts.filter(e => !e.isParent)
        setAccounts(newAccounts)
    }

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

    useEffect(() => {
        getDataAPI()
    }, [])
    
    useEffect(() => {
        setAccountsFromProps()
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

    return (
        <Fragment>
            <LayoutsMainContent>
                    <ContentHeader name="Cash and Bank"/>
                    {/* Entry Content */}
                    <div className="mb-4">
                        <Link to="new-account" className="btn btn-secondary btn-sm">New Transaction</Link>
                    </div>
                    <div className="card pb-4">
                        <div className="card-body">
                            <div className="table-responsive-sm scrollarea">
                                <table className="table table-striped table-sm table-transaction">
                                    <thead>
                                        <tr>
                                            <th scope="col" colSpan={2}>Account</th>
                                            <th scope="col" className="text-start"></th>
                                            {/* <th scope="col" className="text-center"></th> */}
                                            <th scope="col" className="text-end">Debit (Credit)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-group-divider">
                                        {
                                            parentAccounts.map(parentAccount => {
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
                                                            {/* <td className="text-center fw-bold"> { isActive === true ? 'active' : 'not active' } </td> */}
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
                                                                        <td className="ps-2 pe-0 account-number"><Link to={`account-detail/${acc.id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                        <td className="ps-2"><Link to={`account-detail/${acc.id}?page=profile`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                        <td className="text-start">{acc.categoryName}</td>
                                                                        {/* <td className="text-center"> { acc.isActive === true ? 'active' : 'not active' } </td> */}
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
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI())
})

export default connect(reduxState, reduxDispatch)(CashAndBank)