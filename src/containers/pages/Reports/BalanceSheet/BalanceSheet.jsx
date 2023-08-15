import React, { Fragment, useEffect, useState } from "react";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { useAccountFunc, useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import { Link } from "react-router-dom";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";

const BalanceSheet = () => {
    const { getAccGroup } = useAccountFunc()
    const { getTransAPI, getCurrencyAbs } = useGeneralFunc()
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [transactions, setTransactions] = useState([])
    const [parentCurrentAssets, setParentCurrentAssets] = useState([])
    const [parentNonCurrentAssets, setParentNonCurrentAssets] = useState([])
    const [parentLiabilities, setParentLiabilities] = useState([])
    const [parentEquity, setParentEquity] = useState([])
    const [parentIncomeExpense, setParentIncomeExpense] = useState([])

    const getAccountsAPI = async () => {
        const {
            newAccounts,
            newParentAccounts,
            newParentCurrentAssets,
            newParentNonCurrentAssets,
            newParentLiabilities,
            newParentEquity,
            newParentIncomeExpense
        } = await getAccGroup()

        setAccounts(newAccounts)
        setParentAccounts(newParentAccounts)
        setParentCurrentAssets(newParentCurrentAssets)
        setParentNonCurrentAssets(newParentNonCurrentAssets)
        setParentLiabilities(newParentLiabilities)
        setParentEquity(newParentEquity)
        setParentIncomeExpense(newParentIncomeExpense)
    }

    const getTransactions = async () => {
        const newTransactions = await getTransAPI()
        setTransactions(newTransactions)
    }

    const transAmount = (accountId, categoryId) => {
        let parentAmount = 0
        let childAccounts = accounts.filter(e => e.parentId === accountId)
        childAccounts.forEach(acc => {
            let amount = 0
            transactions.forEach(trans => {
                trans.transAccounts.forEach(e => { if(e.account === acc.id) amount = categoryId < 6 ? amount + e.debit - e.credit : amount - e.debit + e.credit })
            })
            acc.amount = acc.id === 41 ? amount + countIncomeExpense() : amount // nanti disesuiakan lagi dengan role laba ditahan
            parentAmount += acc.amount
        })
        return { childAccounts, parentAmount }
    }

    const countIncomeExpense = () => {
        let totalIncomeExpense = 0
        parentIncomeExpense.forEach(parentAccounts => {
            const {id, categoryId} = parentAccounts
            const {parentAmount} = transAmount(id, categoryId)
            totalIncomeExpense += parentAmount
        })
        return totalIncomeExpense
    }

    useEffect(()=>{
        getAccountsAPI()
        getTransactions()
    }, [])

    let totalCurrentAsset = 0, totalNonCurrentAsset = 0, totalLiabilities = 0, totalEquity = 0
    return (
        <LayoutsMainContent>
            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <ContentHeader name="Neraca"/>
                <div className="card pb-4">
                    <div className="card-body">
                        <div className="table-responsive-sm">
                            <table className="table table-sm table-transaction">
                                {/* <thead>
                                    <tr>
                                        <th scope="col" colSpan={2}>Account</th>
                                        <th scope="col" className="text-end"></th>
                                    </tr>
                                </thead> */}
                                <tbody>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">ASET</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Aset Lancar</td>
                                    </tr>
                                    {
                                        parentCurrentAssets.map(parentAccount => {
                                            let { id, number, accountName, categoryId } = parentAccount
                                            const {childAccounts, parentAmount} = transAmount(id, categoryId)
                                            totalCurrentAsset += parentAmount
                                            return (
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        {/* {
                                                            parentAmount < 0 ?
                                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(parentAmount)})`}</td> :
                                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(parentAmount)}</td>
                                                        } */}
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
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
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Aset Lancar</td>
                                        {
                                            totalCurrentAsset < 0 ?
                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalCurrentAsset)})`}</td> :
                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalCurrentAsset)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Aset Tidak Lancar</td>
                                    </tr>
                                    {
                                        parentNonCurrentAssets.map(parentAccount => {
                                            let { id, number, accountName, categoryId } = parentAccount
                                            const {childAccounts, parentAmount} = transAmount(id, categoryId)
                                            totalNonCurrentAsset += parentAmount
                                            return (
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        {/* {
                                                            parentAmount < 0 ?
                                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(parentAmount)})`}</td> :
                                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(parentAmount)}</td>
                                                        } */}
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
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
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Aset Tidak Lancar</td>
                                        {
                                            totalNonCurrentAsset < 0 ?
                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalNonCurrentAsset)})`}</td> :
                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalNonCurrentAsset)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">TOTAL ASET</td>
                                        {
                                            totalCurrentAsset + totalNonCurrentAsset < 0 ?
                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalCurrentAsset + totalNonCurrentAsset)})`}</td> :
                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalCurrentAsset + totalNonCurrentAsset)}</td>

                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>&nbsp;</td>
                                    </tr>

                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">LIABILITAS DAN EKUITAS</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Liabilitas</td>
                                    </tr>
                                    {
                                        parentLiabilities.map(parentAccount => {
                                            let { id, number, accountName, categoryId } = parentAccount
                                            const {childAccounts, parentAmount} = transAmount(id, categoryId)
                                            totalLiabilities += parentAmount
                                            return (
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        {/* {
                                                            parentAmount < 0 ?
                                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(parentAmount)})`}</td> :
                                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(parentAmount)}</td>
                                                        } */}
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
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
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Liabilitas</td>
                                        {
                                            totalLiabilities < 0 ?
                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalLiabilities)})`}</td> :
                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalLiabilities)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Ekuitas</td>
                                    </tr>
                                    {
                                        parentEquity.map(parentAccount => {
                                            let { id, number, accountName, categoryId } = parentAccount
                                            const {childAccounts, parentAmount} = transAmount(id, categoryId)
                                            totalEquity += parentAmount
                                            return (
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        {/* {
                                                            parentAmount < 0 ?
                                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(parentAmount)})`}</td> :
                                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(parentAmount)}</td>
                                                        } */}
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
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
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Ekuitas</td>
                                        {
                                            totalEquity < 0 ?
                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalEquity)})`}</td> :
                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalEquity)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">TOTAL LIABILITAS DAN EKUITAS</td>
                                        {
                                            totalLiabilities + totalEquity < 0 ?
                                                <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalLiabilities + totalEquity)})`}</td> :
                                                <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalLiabilities + totalEquity)}</td>
                                        }
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </LayoutsMainContent>
    )
}

export default BalanceSheet