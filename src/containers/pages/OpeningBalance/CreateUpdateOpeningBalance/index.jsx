import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './CreateUpdateOpeningBalance.scss'

import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import InputValidation from "../../../../components/atoms/InputValidation";
import { ButtonSubmit, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import RowFormOpeningBalance from "../../../../components/molecules/RowFormOpeningBalance";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getOpeningBalanceFromAPI, postOpeningBalanceToAPI, putOpeningBalanceToAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";

import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";

const CreateUpdateOpeningBalance = (props) => {
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let {transId} = useParams()
    transId = transId ? transId : searchParams.get('transId')

    const { getCurrency, getFullDateNow, getNormalNumb, updateProps } = useGeneralFunc()

    const [validation, setValidation] = useState({nominalNull: [], nominalDouble: [], accountNull: []})
    const [isUpdate, setIsUpdate] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [transaction, setTransaction] = useState({
        date: getFullDateNow(),
        memo: '',
        transType: "Opening Balance"
    })
    const [transDb, setTransDb] = useState({})
    const [accountTransactions, setAccountTransactions] = useState([
        { account: "", debit: "", credit: "" }, { account: "", debit: "", credit: "" }
    ])
    
    const getResetUpdate = async (newTransactions) => {
        let newTransaction = {...transaction}
        let newTransAccounts = [{ account: "", debit: "", credit: "" }, { account: "", debit: "", credit: "" }]
        
        if(transId) {
            let dataTransaction = newTransactions.find(e => e.id === transId)
            if(dataTransaction) {
                const {memo, transAccounts, date, authors} = dataTransaction
                newTransAccounts = transAccounts
                updateProps(newTransaction, {memo, authors})
                    
                setTransDb(dataTransaction)
                setIsUpdate(true)
                newTransaction.date = date
            }
        }
        setTransaction(newTransaction)
        setAccountTransactions(newTransAccounts)
        transId && handleCurrency(newTransAccounts)
    }

    const handleEntryTransaction = (data) => {
        const {name, value} = data.target
        let newTransaction = {
            ...transaction,
            [name]: value
        }
        setTransaction(newTransaction)
    }

    const handleAddRow = () => {
        let newAccountTransactions = [...accountTransactions]
        const accountTransaction = { account: "", debit: "", credit: "" }
        newAccountTransactions.push(accountTransaction)
        setAccountTransactions(newAccountTransactions)
    }

    const handleDeleteRow = (rowIndex) => {
        let newAccountTransactions = [...accountTransactions]
        if(accountTransactions.length > 2) {
            newAccountTransactions.splice(rowIndex, 1)
            setAccountTransactions(newAccountTransactions)
        }
    }

    const handleEntryAccount = (data) => {
        let newAccountTransactions = [...accountTransactions]
        let {name, value, id} = data.target
        let idNumb = +id.slice(3)
        name === 'debit' || name === 'credit' ?
            newAccountTransactions[idNumb][name] = +value :
            newAccountTransactions[idNumb][name] = value
        setAccountTransactions(newAccountTransactions)
    }

    // untuk submit
    const handleNormalNumb = () => {
        let newAccountTransactions = [...accountTransactions]
        newAccountTransactions.forEach((acc, i) => {
            const {debit, credit} = acc
            acc.debit = getNormalNumb(debit)
            acc.credit = getNormalNumb(credit)
        })
        setAccountTransactions(newAccountTransactions)
        return newAccountTransactions
    }

    const handleCurrency = (newAccountTransactions) => {
        newAccountTransactions.forEach((acc, i) => {
            const {debit, credit} = acc
            acc.debit = getCurrency(debit)
            acc.credit = getCurrency(credit)
        })
        setAccountTransactions(newAccountTransactions)
    }

    const countValidation = async () => {
        let totalDebit = 0, totalCredit = 0, transCount = 0
        let accountProblem = false
        let rowValidation = {nominalNull: [], nominalDouble: [], accountNull: []}
        let newAccountTransactions = await handleNormalNumb()
        newAccountTransactions.forEach(trans => {
            let tempCount = {nominalNull: 0, nominalDouble: 0, accountNull: 0}
            const {account, debit, credit} = trans
            if(account) {
                transCount++
                if(debit === 0 && credit === 0) { tempCount.nominalNull++; accountProblem = true }
                else if (debit !== 0 && credit !== 0) { tempCount.nominalDouble++; accountProblem = true }
                else { totalDebit += debit; totalCredit += credit }
            } else {
                if(debit !== 0 || credit !== 0) { tempCount.accountNull++; accountProblem = true }
            }
            for( let x in rowValidation ) { rowValidation[x].push(tempCount[x] > 0 ? true : false) }
        })
        return {totalDebit, totalCredit, transCount, accountProblem, rowValidation, newAccountTransactions}
    }

    const getAccountValidation = async () => {
        let {totalDebit, totalCredit, transCount, accountProblem, rowValidation, newAccountTransactions} = await countValidation()
        let newValidation = {...validation}

        if (!accountProblem) {
            if (transCount < 2) {
                accountProblem = true
                transCount < 1 ? 
                    Swal.fire({
                        title: 'Pending!',
                        text: 'There is no transaction account, the transaction cannot be processed!!',
                        icon: 'warning',
                        confirmButtonColor: '#fd7e14'
                    })
                    :
                    Swal.fire({
                        title: 'Pending!',
                        text: 'Only one account, transactions must be at least two accounts!!',
                        icon: 'warning',
                        confirmButtonColor: '#fd7e14'
                    })
            } else if (totalDebit !== totalCredit) {
                accountProblem = true
                Swal.fire({
                    title: 'Pending!',
                    text: 'Debit and credit unmatch!!',
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            }
        } 
        if(isUpdate) {
            accountProblem = true
            newValidation.numberNull = true
        }

        accountProblem && await handleCurrency(newAccountTransactions)

        for( let x in rowValidation ) { newValidation[x] = rowValidation[x] }
        setValidation(newValidation)
        return {accountProblem, newAccountTransactions}
    }

    const postDataToAPI = async (newTransaction) => {
        let authors = [{
            createdBy: props.user.uid2,
            createdAt: Date.now(),
        }]
        let dataReadyToPost = {
            ...newTransaction,
            authors,
        }
        const res = await props.postOpeningBalanceToAPI(dataReadyToPost)
        if(res) {
            navigate('/opening-balance')
            Swal.fire({
                title: 'Good job!',
                text: `${dataReadyToPost.transType} created`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
    }
    
    const putDataToAPI = async (newTransaction) => {
        let dataReadyToUpdate = {...newTransaction}
        dataReadyToUpdate.authors.push({
            updatedBy: props.user.uid2,
            updatedAt: Date.now()
        })
        const res = await props.putOpeningBalanceToAPI(dataReadyToUpdate)
        if(res) {
            navigate('/opening-balance')
            Swal.fire({
                title: 'Nice!',
                text: `${newTransaction.transType} updated`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
    }

    const handleSubmit = async () => {
        let {accountProblem, newAccountTransactions} = await getAccountValidation()
        if(!accountProblem) {
            let newTransaction = {
                ...transaction,
                transAccounts: newAccountTransactions.filter(e => e.account)
            }
            for(let i in newTransaction) {
                !newTransaction[i] && delete newTransaction[i]
            }
            if(isUpdate) {
                updateProps(newTransaction, {id: transDb.id})
                await putDataToAPI(newTransaction)
            } else {
                await postDataToAPI(newTransaction)
            }
        }
    }

    useEffect(() => {
        props.getOpeningBalanceFromAPI()
        props.getAccountsFromAPI()
    }, [])

    useEffect(() => {
        let newTransactions = []
        for(let x in props.transactions) {
            if( x === 'openingBalance' ) {
                props.transactions[x].forEach(e => {
                    newTransactions.push(e)
                })
            }
        }
        getResetUpdate(newTransactions)
    }, [props.transactions])

    useEffect(() => {
        let newAccounts = []
        let newParentAccounts = []
        props.accounts.forEach(e => {
            if(e.categoryId < 9) {
                if(e.isParent) {
                    newParentAccounts.push(e)
                } else {
                    e.isActive && newAccounts.push(e)
                }
            }
        })
        newParentAccounts.forEach((e, i) => {
            let childAccount = newAccounts.find(acc => e.id === acc.parentId)
            if(!childAccount || !e.isActive) newParentAccounts.splice(i,1)
        })
        setAccounts(newAccounts)
        setParentAccounts(newParentAccounts)
    }, [props.accounts])
    
    const {nominalNull, nominalDouble, accountNull} = validation

    return (
        <LayoutsMainContent>
            <ContentHeader name={isUpdate ? 'Edit Transaction' : 'Create Transaction'}/>
            {/* Entry Content */}
            <div className="card pb-5 create-update-opening-balance">
                <div className="card-header">
                    Opening Balance
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2">
                            <label htmlFor="date" className="form-label mb-0">Date</label>
                            <input type="date" className="form-control form-control-sm" id="date" name="date" onChange={handleEntryTransaction} value={transaction.date} />
                        </div>
                        <div className="col-sm-6 col-md-8 col-lg-6 col-xl-5">
                            <label htmlFor="memo" className="form-label mb-0">Memo</label>
                            <textarea className="form-control form-control-sm" id="memo" name="memo" rows="4" onChange={handleEntryTransaction} value={transaction.memo} />
                        </div>
                    </div>
                    <div className="table-responsive-lg mb-4 mb-sm-5">
                        <table className="table table-hover trans-account">
                            <thead>
                                <tr className="header-row">
                                    <th className="text-start column-account" colSpan={2}>Opening Account</th>
                                    <th className="text-end pe-3 column-debit">Debit</th>
                                    <th className="text-end pe-3 column-credit">Credit</th>
                                    {/* <th>
                                        <button className="btn btn-outline-success btn-sm delete-row add-row" onClick={handleAddRow}>+</button>
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    parentAccounts.map((parent) => 
                                        <Fragment>
                                            <tr className="fw-bold" key={parent.id}>
                                                <td className="ps-2 pe-0 number-account">
                                                    {parent.number}
                                                </td>
                                                <td colSpan={3}>{parent.accountName}</td>
                                            </tr>
                                            {
                                                accounts.map((account, i) =>
                                                    account.parentId === parent.id &&
                                                        <tr key={i}>
                                                            <td className="ps-2 pe-0 number-account">
                                                                {account.number}
                                                            </td>
                                                            <td >
                                                                {account.accountName}
                                                            </td>
                                                            <td>
                                                                <input type="text" name="debit" 
                                                                id={'db-'+i} min={0} className={`form-control form-control-sm text-end debit account-value`}  autoComplete="off" />
                                                                {/* {nominalDouble && <InputValidation name="nominal double" /> } */}
                                                            </td>
                                                            <td>
                                                                <input type="text" name="credit" id={'cr-'+i} min={0} className={`form-control form-control-sm credit text-end account-value`} autoComplete="off" />
                                                                {/* {nominalDouble && <InputValidation name="nominal double" /> } */}
                                                            </td>
                                                        </tr>
                                                    // )
                                                )
                                            }
                                        </Fragment>
                                    )
                                }
                                {/* {
                                    accountTransactions.map((trans, row)=> {
                                        // const {account, debit, credit} = trans
                                        const formValidation = [ nominalNull[row], nominalDouble[row], accountNull[row] ]
                                        const rowFormFunc= { handleEntryAccount, handleDeleteRow, handleSubmit, setAccountTransactions: (e)=>setAccountTransactions(e) }
                                        const data = { row, accounts, formValidation, parentAccounts, accountTransactions }
                                        return <RowFormOpeningBalance key={row} rowFormFunc={rowFormFunc} data={data}/>
                                    })
                                } */}
                            </tbody>
                        </table>
                    </div>
                    <ButtonSubmit handleOnClick={handleSubmit} isUpdate={isUpdate} color="outline-primary"/>
                    &nbsp;&nbsp;&nbsp;
                    <ButtonLinkTo name="Cancel" linkTo={'/opening-balance'} color="outline-danger"/>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    user: state.user,
    transactions: state.transactions,
    accounts: state.accounts
})
const reduxDispatch = (dispatch) => ({
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    postOpeningBalanceToAPI: (data) => dispatch(postOpeningBalanceToAPI(data)),
    putOpeningBalanceToAPI: (data) => dispatch(putOpeningBalanceToAPI(data))
})

export default connect(reduxState, reduxDispatch)(CreateUpdateOpeningBalance)