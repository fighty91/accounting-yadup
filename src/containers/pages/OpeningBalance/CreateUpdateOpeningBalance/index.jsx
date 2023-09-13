import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import InputValidation from "../../../../components/atoms/InputValidation";
import { ButtonSubmit, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI, postOpeningBalanceToAPI, putOpeningBalanceToAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";
import './CreateUpdateOpeningBalance.scss'

const CreateUpdateOpeningBalance = (props) => {
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let isUpdate = JSON.parse(searchParams.get('isUpdate'))

    const { getCurrency, getCurrencyAbs, getFullDateNow, getNormalNumb, deleteProps } = useGeneralFunc()

    const [validation, setValidation] = useState({nominalNull: [], nominalDouble: [], accountNull: []})
    const [parentAccounts, setParentAccounts] = useState([])
    const [minTransDate, setMinTransDate] = useState('')
    const [totalAmount, setTotalAmount] = useState({totalDebit: 0, totalCredit: 0})
    const [accountTransactions, setAccountTransactions] = useState([
        { account: "", debit: "", credit: "", parentId: "", number: '', accountName: '' }
    ])
    const [transaction, setTransaction] = useState({
        date: getFullDateNow(),
        memo: '',
        tNId: 'defaultId',
        tNParams: 'defaultCode',
        transType: "Opening Balance"
    })

    const handleEntryTransaction = (data) => {
        const {name, value} = data.target
        let newTransaction = {
            ...transaction,
            [name]: value
        }
        setTransaction(newTransaction)
    }

    const handleChangeDebitCredit = (data) => {
        let newAccountTransactions = [...accountTransactions]
        let {name, value, id} = data.target
        let idNumb = +id.slice(3)
        newAccountTransactions[idNumb][name] = value
        setAccountTransactions(newAccountTransactions)
    }

    const handleFocusInputNumb = (event) => {
        let {name, id, value} = event.target
        let target = {name, id, value}
        value !== '' && (target.value = getNormalNumb(value))
        handleChangeDebitCredit({target})
    }
    const handleEntryInputNumb = (event) => {
        let {name, id, value} = event.target
        if(value > -1) {
            let target = {name, id, value: +value}
            handleChangeDebitCredit({target})
        }
    } 
    const handleBlurInputNumb = (event) => {
        let {name, id, value} = event.target
        let target = {name, id, value}
        value !== '' && (target.value = getCurrency(value))
        handleChangeDebitCredit({target})
        getTotalAmount(accountTransactions)
    }
    const getTotalAmount = (data) => {
        let totalDebit = 0, totalCredit = 0
        data.forEach(e => {
            totalDebit += getNormalNumb(e.debit)
            totalCredit += getNormalNumb(e.credit)
        })
        setTotalAmount({totalDebit, totalCredit})
    }

    // untuk submit
    const handleNormalNumb = () => {
        let newAccountTransactions = [...accountTransactions]
        newAccountTransactions.forEach(acc => {
            acc.debit = getNormalNumb(acc.debit)
            acc.credit = getNormalNumb(acc.credit)
        })
        setAccountTransactions(newAccountTransactions)
        return newAccountTransactions
    }
    const handleCurrency = (newAccountTransactions) => {
        newAccountTransactions.forEach(acc => {
            const {debit, credit} = acc
            acc.debit = getCurrency(debit)
            acc.credit = getCurrency(credit)
        })
        setAccountTransactions(newAccountTransactions)
    }

    const countValidation = async () => {
        let totalDebit = 0, totalCredit = 0, transCount = 0
        let accountProblem = false
        let nominalDouble = []
        let newAccountTransactions = handleNormalNumb()
        newAccountTransactions.forEach(trans => {
            let nominalDoubleCount = 0
            const {debit, credit} = trans
            if(debit > 0 || credit > 0) {
                transCount++
                totalDebit += debit; totalCredit += credit
            }
            if(debit !== 0 && credit !== 0) {
                nominalDoubleCount++
                accountProblem = true
            }
            nominalDouble.push(nominalDoubleCount > 0 ? true : false)
        })
        return {totalDebit, totalCredit, transCount, accountProblem, nominalDouble, newAccountTransactions}
    }

    const getAccountValidation = async () => {
        let {totalDebit, totalCredit, transCount, accountProblem, nominalDouble, newAccountTransactions} = await countValidation()
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
            }
            else if (totalDebit !== totalCredit) {
                accountProblem = true
                Swal.fire({
                    title: 'Pending!',
                    text: 'Debit and credit unmatch!!',
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            } 
            else if(transaction.date > minTransDate) {
                accountProblem = true
                newValidation.dateMustSmall = true
                Swal.fire({
                    title: 'Pending!',
                    text: 'Date must be smaller than the other transaction date!!',
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            }
            else if(!isUpdate) {
                const transCheck = await props.getOpeningBalanceFromAPI()
                if(transCheck.length > 0) {
                    accountProblem = true
                    Swal.fire({
                        title: "Can't be Processed!",
                        text: 'Opening balance already exist!!',
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    })
                    navigate('/opening-balance')
                }
            } 
        }
        accountProblem && handleCurrency(newAccountTransactions)
        newValidation.nominalDouble = nominalDouble
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
                text: 'Transaction created',
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
    }
    
    const putDataToAPI = async (newTransaction) => {
        console.log(newTransaction)
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
                text: 'Transaction updated',
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
    }
    
    const lostConnection = () => Swal.fire({
        title: 'Offline!',
        text: 'Sorry, your internet connection is lost!!',
        icon: 'warning',
        confirmButtonColor: '#fd7e14'
    })

    const handleSubmit = async () => {
        if(window.navigator.onLine) {
            let {accountProblem, newAccountTransactions} = await getAccountValidation()
            if(!accountProblem) {
                let transAccounts = newAccountTransactions.filter(e => e.debit || e.credit)
                transAccounts.forEach(e => deleteProps(e, ['parentId', 'number', 'accountName']))
                let newTransaction = {
                    ...transaction,
                    transAccounts
                }
                for(let i in newTransaction) {
                    !newTransaction[i] && delete newTransaction[i]
                }
                isUpdate ?
                await putDataToAPI(newTransaction) : await postDataToAPI(newTransaction)
            }
        }
        else lostConnection()
    }

    const handleEnterKey = async (event) => {
        if(event.key === "Enter") {
            await event.target.blur()
            await handleSubmit()
        }
    }

    const getOpeningBalance = async(data) => {
        let temp = props.transactions.openingBalance
        !temp && (temp = await props.getOpeningBalanceFromAPI())
        
        if(temp.length > 0) {
            let newTransAccounts = data
            const {id, date, memo, authors, transAccounts} = temp[0]
            let newTransaction = {
                ...transaction, id, date, authors,
                memo: memo ? memo : ''          
            }
            newTransAccounts.forEach(e => {
                transAccounts.find(a => a.account === e.account && (
                    e.debit = getCurrency(a.debit),
                    e.credit = getCurrency(a.credit)
                ))
            })
            setTransaction(newTransaction)
            setAccountTransactions(newTransAccounts)
            getTotalAmount(newTransAccounts)
        }
        else navigate('/opening-balance')
    }

    const getTransactionsDate = async() => {
        let tempDate = []

        const temp1 = props.transactions.journalEntries
        const journalEntries = temp1 ? temp1 : await props.getJournalEntriesFromAPI()
        journalEntries.forEach(e => tempDate.push(e.date))
    
        const temp2 = props.transactions.paymentJournal
        const paymentJournal = temp2 ? temp2 : await props.getPaymentJournalsFromAPI()
        paymentJournal.forEach(e => tempDate.push(e.date))
    
        const temp3 = props.transactions.receiptJournal
        const receiptJournal = temp3 ? temp3 : await props.getReceiptJournalsFromAPI()
        receiptJournal.forEach(e => tempDate.push(e.date))
    
        tempDate.sort((a, b) => 
            a < b ? -1 :
            a > b ? 1 : 0
        )
        tempDate.length > 0 && setMinTransDate(tempDate[0])
    }
    useEffect(() => {
        getTransactionsDate()
    }, [])

    const getAccount = async() => {
        let newAccounts = [], newParentAccounts = [], newAccountTransactions = []
        let temp = props.accounts
        let accounts = temp.length > 0 ? temp : await props.getAccountsFromAPI()
        accounts.forEach(e => {
            const {categoryId, isActive, isParent, id, parentId, number, accountName} = e
            if(categoryId < 9 && isActive) {
                if(!isParent) {
                    newAccounts.push(e)
                    newAccountTransactions.push({account: id, debit: '', credit: '', parentId, number, accountName})
                }
                else newParentAccounts.push(e)
            }
        })
        newParentAccounts.forEach((parent, i) => 
            !newAccounts.find(acc => parent.id === acc.parentId) && newParentAccounts.splice(i,1)
        )
        setParentAccounts(newParentAccounts)
        isUpdate ? getOpeningBalance(newAccountTransactions) : setAccountTransactions(newAccountTransactions)
    }
    useEffect(() => {
        getAccount()
    }, [])
    
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
                            <input type="date" className={`form-control form-control-sm ${validation.dateMustSmall && 'border-danger'}`} id="date" name="date" onChange={handleEntryTransaction} value={transaction.date} />
                            {validation.dateMustSmall && <InputValidation name="date must be smaller than the other transaction date"/> }
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
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    accountTransactions &&
                                    parentAccounts.map(parent => 
                                        <Fragment key={parent.id}>
                                            <tr className="fw-bold" >
                                                <td className="ps-2 pe-0 number-account">
                                                    {parent.number}
                                                </td>
                                                <td colSpan={3}>{parent.accountName}</td>
                                            </tr>
                                            {
                                                accountTransactions.map((account, i) =>
                                                    account.parentId === parent.id &&
                                                    <tr key={i}>
                                                        <td className="ps-2 pe-0 number-account">{account.number}</td>
                                                        <td>{account.accountName}</td>
                                                        <td>
                                                            <input type="text" name="debit" 
                                                            id={'db-'+i} min={0} className={`form-control form-control-sm text-end debit account-value ${validation.nominalDouble[i] && 'border-danger'}`}  autoComplete="off" value={account.debit} onFocus={handleFocusInputNumb} onChange={handleEntryInputNumb} onBlur={handleBlurInputNumb} onKeyUp={handleEnterKey} />
                                                            {validation.nominalDouble[i] && <InputValidation name="nominal double"/> }
                                                        </td>
                                                        <td>
                                                            <input type="text" name="credit" 
                                                            id={'cr-'+i} min={0} className={`form-control form-control-sm credit text-end account-value ${validation.nominalDouble[i] && 'border-danger'}`} autoComplete="off" value={accountTransactions[i].credit} onFocus={handleFocusInputNumb} onChange={handleEntryInputNumb} onBlur={handleBlurInputNumb} onKeyUp={handleEnterKey} />
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        </Fragment>
                                    )
                                }
                                <tr style={{fontSize : '18px'}}>
                                    <td className="ps-2 pe-0 number-account fw-bold text-secondary" colSpan={2}>Total Amount</td>
                                    <td className="fw-bold text-end text-primary">
                                        {getCurrencyAbs(totalAmount.totalDebit)}
                                    </td>
                                    <td className="fw-bold text-end text-primary">
                                        {getCurrencyAbs(totalAmount.totalCredit)}
                                    </td>
                                </tr>
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
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    postOpeningBalanceToAPI: (data) => dispatch(postOpeningBalanceToAPI(data)),
    putOpeningBalanceToAPI: (data) => dispatch(putOpeningBalanceToAPI(data))
})

export default connect(reduxState, reduxDispatch)(CreateUpdateOpeningBalance)