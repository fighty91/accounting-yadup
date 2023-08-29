import React, { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { deleteOpeningBalanceFromAPI, getAccountsFromAPI, getCategoriesFromAPI, getOpeningBalanceFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";
import './OpeningBalance.scss'

import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";

const OpeningBalance = (props) => {
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [categories, setCategories] = useState([])
    // const [transactions, setTransactions] = useState([])
    const [openingBalance, setOpeningBalance] = useState({})

    const { getCurrencyAbs } = useGeneralFunc()
    
    const handleDelete = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Would you clear opening balance?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, do it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const successClear = props.deleteOpeningBalanceFromAPI(openingBalance.id)
                successClear &&
                Swal.fire({
                    title: 'Success',
                    text: 'Opening balance has emptied',
                    icon: 'success',
                    confirmButtonColor: '#198754'
                })
            }
        })
    }

    const setAccountsFromProps = () => {
        const newParentAccounts = props.accounts.filter(e => e.isParent && e.categoryId < 9)
        setParentAccounts(newParentAccounts)
        const newAccounts = props.accounts.filter(e => !e.isParent)
        setAccounts(newAccounts)
    }

    const accountAmount = (accountId) => {
        let childAccounts = accounts.filter(e => e.parentId === accountId)
        childAccounts.forEach(acc => {
            let amount = 0
            openingBalance && openingBalance.transAccounts.forEach(e => {
                if(e.account === acc.id) amount = amount + e.debit - e.credit
            })
            acc.amount = amount
            const category = categories.find(e => e.id === acc.categoryId)
            acc.categoryName = category && category.name
        })
        return { childAccounts }
    }

    useEffect(() => {
        props.getAccountsFromAPI()
        props.getCategoriesFromAPI()
    }, [])
    
    useEffect(() => {
        setAccountsFromProps()
    }, [props.accounts])

    useEffect(() => {
        setCategories(props.categories)
    }, [props.categories])
    
    useEffect(() => {
        let temp
        props.transactions.openingBalance ? temp = props.transactions.openingBalance[0] : props.getOpeningBalanceFromAPI()
        setOpeningBalance(temp)
    }, [props.transactions])

    let totalDebit = 0, totalCredit = 0

    return (
        <Fragment>
            <LayoutsMainContent>
                    <ContentHeader name="Opening Balance"/>
                    {/* Entry Content */}
                    <div className="mb-4">
                        {
                            openingBalance ?
                            <div className="dropdown">
                                <button className="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Action
                                </button>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                    <li><Link className="dropdown-item" to="#">Update Opening Balance</Link></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><button className="dropdown-item" onClick={handleDelete}>Clear Opening Balance</button></li>
                                </ul>
                            </div>
                            :
                            <Link to="create-opening-balance" className="btn btn-secondary btn-sm">Create Opening Balance</Link>
                        }
                    </div>
                    <div className="card pb-4">
                        <div className="card-body">
                            {
                                openingBalance ?
                                <div className="table-responsive-sm">
                                    <table className="table table-striped table-sm table-transaction">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="ps-2" colSpan={2}>Account</th>
                                                <th scope="col" className="text-end">Debit</th>
                                                <th scope="col" className="text-end pe-2">Credit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-group-divider">
                                            {
                                                parentAccounts.map(parentAccount => {
                                                    let { id, number, accountName } = parentAccount
                                                    const {childAccounts} = accountAmount(id)
                                                    return (
                                                        <Fragment key={id}>
                                                            <tr>
                                                                <td className="fw-bold ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                                <td className="fw-bold ps-2"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                                <td className="text-end fw-bold pe-2"></td>
                                                                <td className="text-end fw-bold pe-2"></td>
                                                            </tr>
                                                            {
                                                                childAccounts.map(acc => {
                                                                    const amount = acc.amount
                                                                    amount > 0 ? totalDebit += amount : totalCredit += amount
                                                                    return (
                                                                        <tr key={acc.id}>
                                                                            <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                            <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=profile`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                            <td className="text-end">
                                                                                { getCurrencyAbs(amount > 0 ? amount : 0) }
                                                                            </td>
                                                                            <td className="text-end pe-2">
                                                                                { getCurrencyAbs(amount < 0 ? amount : 0) }
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })
                                                            }
                                                        </Fragment>
                                                    )
                                                })
                                            }
                                            <tr className="fw-bold">
                                                <td className="ps-2 pe-2 text-secondary" colSpan={2}>Total Amount</td>
                                                <td className="text-end text-primary">
                                                    { getCurrencyAbs(totalDebit) }
                                                </td>
                                                <td className="text-end pe-2 text-primary">
                                                    { getCurrencyAbs(totalCredit) }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                :
                                <p>There are no transactions...</p>
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
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    deleteOpeningBalanceFromAPI: (data) => dispatch(deleteOpeningBalanceFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(OpeningBalance)