import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import ModalIdenticalCode from "../../../../components/molecules/ModalIdenticalCode";
import InputValidation from "../../../../components/atoms/InputValidation";
import { ButtonSubmit, ButtonNavigate } from "../../../../components/atoms/ButtonAndLink";
import RowFormClosingJournal from "../../../../components/molecules/RowFormClosingJournal";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getClosingJournalsFromAPI, getClosingJournalFromAPI, getNumberListFromAPI, getTransNumberFromAPI, incrementLastOrderTNFromAPI, postClosingJournalToAPI, postNumberListToAPI, putClosingJournalToAPI, putNumberListToAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import { getCurrency, getFullDateNow, getNormalNumb } from "../../../organisms/MyFunctions/useGeneralFunc";
import './CreateUpdateClosingJournal.scss'

const CreateUpdateClosingJournal = (props) => {
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let duplicate = JSON.parse(searchParams.get('duplicate'))
    let {transId} = useParams()
    !transId && (transId = searchParams.get('transId'))

    const [validation, setValidation] = useState({nominalNull: [], nominalDouble: [], accountNull: []})
    const [isUpdate, setIsUpdate] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [transaction, setTransaction] = useState({
        date: getFullDateNow(),
        memo: '',
        transType: "Closing Journal"
    })
    const [transDb, setTransDb] = useState({})
    const [accountTransactions, setAccountTransactions] = useState([
        {account: "", description: "", debit: "", credit: "" }, { account: "", description: "", debit: "", credit: ""}
    ])
    const [transNumber, setTransNumber] = useState('')
    const [transNumberList, setTransNumberList] = useState([])
    
    const [transNumberAvailable, setTransNumberAvailable] = useState(true)
    const [identicalAvailable, setIdenticalAvailable] = useState(true)
    const [lastInitialDigit, setLastInitialDigit] = useState(false)
    const [lastInitialSpace, setLastInitialSpace] = useState(false)
    const [firstInitialSpace, setFirstInitialSpace] = useState(false)

    const [showFormIdentic, setShowFormIdentic] = useState(false)
    const [formIdentical, setFormIdentical] = useState({ initialCode:'', startFrom:'' })
    const [identicalCode, setIdenticalCode] = useState({
        codeFor: "closingJournal", lastCode: "", codeList: [{ initialCode: "", startFrom: "" }]
    })
    const [submitLoading, setSubmitLoading] = useState(false)

    const getResetUpdate = async (dataTransaction) => {
        if(dataTransaction) {
            const {memo, transAccounts, date, authors} = dataTransaction
            let newTransAccounts = []
            transAccounts.forEach(e => newTransAccounts.push(e))
            let tempTransaction = {...transaction, memo, authors}

            if(duplicate) setIsDuplicate(true)
            else {
                setTransDb(dataTransaction)
                setIsUpdate(true)
                
                const {tNId, tNParams} = dataTransaction
                const tempNumb = await props.getTransNumberFromAPI({tNId, tNParams, codeFor: 'closingJournal'})
                setTransNumber(tempNumb)
                tempTransaction.date = date
                tempTransaction.tNId = tNId
                tempTransaction.tNParams = tNParams
            }
            setTransaction(tempTransaction)
            handleCurrency(newTransAccounts)
        }
    }

    const getResetFormIdentical = () => {
        setFormIdentical({ initialCode:'', startFrom:'' })
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
        const accountTransaction = { account: "", description: "", debit: "", credit: "" }
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
        let newAccountTransactions = handleNormalNumb()
        newAccountTransactions.forEach(trans => {
            let tempCount = {nominalNull: 0, nominalDouble: 0, accountNull: 0}
            const {account, debit, credit} = trans
            if(account) {
                transCount++
                if(debit === 0 && credit === 0) {
                    tempCount.nominalNull++
                    accountProblem = true
                }
                else if (debit !== 0 && credit !== 0) {
                    tempCount.nominalDouble++
                    accountProblem = true
                }
                else {
                    totalDebit += debit
                    totalCredit += credit
                }
            } else {
                if(debit !== 0 || credit !== 0) {
                    tempCount.accountNull++
                    accountProblem = true
                }
            }
            for( let x in rowValidation ) {
                rowValidation[x].push(tempCount[x] > 0 ? true : false)
            }
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
        if(transNumber) {
            let numbExist = transNumberList.find(e => e === transNumber)
            if(isUpdate) {
                numbExist === transDb.transNumber && (numbExist = undefined)
            }
            if(numbExist) {
                setTransNumberAvailable(false)
                accountProblem = true
            }
        } else if(isUpdate) {
            accountProblem = true
            newValidation.numberNull = true
        }
        accountProblem && handleCurrency(newAccountTransactions)

        for( let x in rowValidation ) { newValidation[x] = rowValidation[x] }
        setValidation(newValidation)
        return {accountProblem, newAccountTransactions}
    }

    const getIncrement = async(lessTime) => {
        const {codeFor, lastCode} = identicalCode
        const tNParams = lastCode
        let tempStart = 0
        identicalCode.codeList.find(e => e.initialCode === tNParams && (tempStart = e.startFrom))
        const tempTime = Math.floor(Math.random() * (lessTime ? 701 : 1401))
        return new Promise(resolve => {
            setTimeout(async() => {
                let tempNumber = await props.incrementLastOrderTNFromAPI({tempStart, tNParams, codeFor})
                resolve(tempNumber)
            }, tempTime)
        })
    }
    const checkPostNL = async(tempNumber) => {
        const {codeFor, lastCode} = identicalCode
        const tNParams = lastCode
        let temp = await props.getNumberListFromAPI({tNParams, codeFor})
        if(temp) {
            temp = temp.filter(e => e.transNumber === tempNumber)
            if(temp.length > 1) {
                for(let i = 1; i < temp.length; i++) {
                    let tempNumber = await getIncrement(true)
                    temp[i].transNumber = tempNumber
                    await props.putNumberListToAPI({tempTN: temp[i], tNParams, codeFor})
                    await checkPostNL(tempNumber)
                }
            }
        }
    }
    const postDataToAPI = async (newTransaction) => {
        const {codeFor, lastCode} = identicalCode
        const tNParams = lastCode
        let tempNumber = await getIncrement()
        const tNId = await props.postNumberListToAPI({tempNumber, tNParams, codeFor})
        await checkPostNL(tempNumber)

        let authors = [{
            createdBy: props.user.uid2,
            createdAt: Date.now(),
        }]
        let dataReadyToPost = {
            ...newTransaction, authors,
            tNParams, tNId
        }
        const res = await props.postClosingJournalToAPI(dataReadyToPost)
        if(res) {
            navigate(`/closing-journal/transaction-detail/${res}`)
            const tempNumb = await props.getTransNumberFromAPI({tNId, tNParams, codeFor})
            Swal.fire({
                title: 'Good job!',
                text: `${dataReadyToPost.transType} #${tempNumb} created`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
        setSubmitLoading(false)
    }
    const putDataToAPI = async (newTransaction) => {
        let dataReadyToUpdate = {...newTransaction}
        dataReadyToUpdate.authors.push({
            updatedBy: props.user.uid2,
            updatedAt: Date.now()
        })
        const res = await props.putClosingJournalToAPI(dataReadyToUpdate)
        if(res) {
            navigate(`/closing-journal/transaction-detail/${transDb.id}`)
            Swal.fire({
                title: 'Nice!',
                text: `${newTransaction.transType} #${transNumber} updated`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
        setSubmitLoading(false)
    }

    const lostConnection = () => Swal.fire({
        title: 'Offline!',
        text: 'Sorry, your internet connection is lost!!',
        icon: 'warning',
        confirmButtonColor: '#fd7e14'
    })

    const handleSubmit = async () => {
        !window.navigator.onLine && lostConnection()
        if(!submitLoading && window.navigator.onLine) {
            setSubmitLoading(true)
            const {accountProblem, newAccountTransactions} = await getAccountValidation()
            if(!accountProblem) {
                let newTransaction = {
                    ...transaction,
                    transAccounts: newAccountTransactions.filter(e => e.account)
                }
                for(let i in newTransaction) {
                    !newTransaction[i] && delete newTransaction[i]
                }
                isUpdate ?
                await putDataToAPI({...newTransaction, id: transDb.id}) : await postDataToAPI(newTransaction)
            }
            else setSubmitLoading(false)
        }
    }

    const handleButtonIdentical = () => {
        setShowFormIdentic(false)
        setIdenticalAvailable(true)
        setLastInitialDigit(false)
        setLastInitialSpace(false)
        setFirstInitialSpace(false)
        getResetFormIdentical()
    }

    const getCancel = () => {
        const temp = isUpdate || isDuplicate
        navigate(temp ? `/closing-journal/transaction-detail/${transId}` : '/closing-journal')
    }

    const getClosingJournal = async() => {
        const tempTrans = await props.getClosingJournalFromAPI(transId)
        if(tempTrans) getResetUpdate(tempTrans)
        else {
            Swal.fire({
                title: 'No Available!',
                text: 'You are trying to access unavailable data',
                icon: 'warning',
                confirmButtonColor: '#fd7e14'
            })
            navigate('/closing-journal')
        }
    }
    useEffect(() => {
        transId && getClosingJournal()
    }, [])
    
    useEffect(() => {
        !props.transactions.closingJournal && props.getClosingJournalsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.transactions.closingJournal
        let newTransNumbers = []
        temp && temp.forEach(e => newTransNumbers.push(e.transNumber))
        setTransNumberList(newTransNumbers)
    }, [props.transactions])

    const getAccounts = () => {
        const tempAccounts = props.accounts.filter(e => e.categoryId >= 8)
        let newAccounts = [], newParentAccounts = []
        tempAccounts.forEach(e => e.isParent ?
            newParentAccounts.push(e) :
            e.isActive && newAccounts.push(e)
        )
        newParentAccounts.forEach((e, i) => {
            let childAccount = newAccounts.find(acc => e.id === acc.parentId)
            if(!childAccount || !e.isActive) newParentAccounts.splice(i,1)
        })
        setAccounts(newAccounts)
        setParentAccounts(newParentAccounts)
    }
    useEffect(() => {
        props.accounts.length === 0 && props.getAccountsFromAPI()
    }, [])
    useEffect(() => {
        props.accounts.length > 0 && getAccounts()
    }, [props.accounts])
    
    const {lastCode} = identicalCode
    let numbPlaceHolder = isUpdate ? '' : `${lastCode === 'defaultCode' ? '' : lastCode+'.'}[auto]`
    const {nominalNull, nominalDouble, accountNull} = validation

    return (
        <LayoutsMainContent>
            <ContentHeader name={isUpdate ? 'Edit Transaction' : 'New Transaction'}/>
            {/* Entry Content */}
            <div className="card pb-5 create-update-closing-journal">
                <div className="card-header">
                    Closing Journal
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2">
                            <label htmlFor="date" className="form-label mb-0">Date</label>
                            <input type="date" className="form-control form-control-sm" id="date" name="date" onChange={handleEntryTransaction} value={transaction.date} />
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2">
                            <div className="d-inline-flex col-12">
                            <label htmlFor="transNumber" className="form-label mb-0">Number</label>
                            {
                                !isUpdate &&
                                <div onClick={handleButtonIdentical}>
                                    <svg className="bi trans-number-setting" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        <use xlinkHref="#gear-wide-connected"/>
                                    </svg>
                                </div>
                            }
                            </div>
                            {/* <input type="text" className={`form-control form-control-sm me-1 ${!transNumberAvailable && 'border-danger'} ${validation.numberNull && 'border-danger'}`}  id="transNumber" name="transNumber" onChange={handleEntryTransNumber} placeholder={numbPlaceHolder} autoComplete="off" value={transNumber}/> */}
                            <input type="text" className={'form-control form-control-sm me-1'}  id="transNumber" name="transNumber" placeholder={numbPlaceHolder} autoComplete="off" value={transNumber} disabled/>
                            { !transNumberAvailable && <InputValidation name="not available, number already exist"/> }
                            { validation.numberNull && <InputValidation name="number null"/> }
                        </div>
                        <div className="col-sm-6 col-md-8 col-lg-6 col-xl-6">
                            <label htmlFor="memo" className="form-label mb-0">Memo</label>
                            <textarea className="form-control form-control-sm" id="memo" name="memo" rows="4" onChange={handleEntryTransaction} value={transaction.memo} />
                        </div>
                    </div>
                    <div className="table-responsive-lg mb-4 mb-sm-5">
                        <table className="table table-borderless trans-account">
                            <thead>
                                <tr>
                                    <th className="text-start column-account">Account</th>
                                    <th className="text-start ps-3">Description</th>
                                    <th className="text-end pe-3 column-debit">Debit</th>
                                    <th className="text-end pe-3 column-credit">Credit</th>
                                    <th>
                                        <button className="btn btn-outline-success btn-sm delete-row add-row" onClick={handleAddRow}>+</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    accountTransactions.map((trans, row)=> {
                                        const {account, description, debit, credit} = trans
                                        const formValidation = [nominalNull[row], nominalDouble[row], accountNull[row]]
                                        const rowFormFunc= {handleEntryAccount, handleDeleteRow, handleSubmit, setAccountTransactions: (e)=>setAccountTransactions(e)}
                                        const data = {row, account, accounts, description, debit, credit, formValidation, parentAccounts, accountTransactions}
                                        return <RowFormClosingJournal key={row} rowFormFunc={rowFormFunc} data={data}/>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    {
                        submitLoading ?
                        <ButtonSubmit name='Loading' color="outline-primary"/>
                        :
                        <ButtonSubmit handleOnClick={handleSubmit} isUpdate={isUpdate} color="outline-primary"/>
                    }
                    &nbsp;&nbsp;&nbsp;
                    <ButtonNavigate name="Cancel" handleOnClick={getCancel} color="outline-danger"/>
                </div>
            </div>

            {/* Modal */}
            <ModalIdenticalCode 
                data={
                    {
                        identicalCode,
                        showFormIdentic,
                        formIdentical,
                        identicalAvailable,
                        lastInitialDigit,
                        lastInitialSpace,
                        firstInitialSpace
                    }
                }
                identicalState={
                    {
                        setIdentical: (value)=>setIdenticalCode(value),
                        setAvailable: (value)=>setIdenticalAvailable(value),
                        setShowForm: (value)=>setShowFormIdentic(value),
                        setLastInitialDigit: (value)=>setLastInitialDigit(value),
                        setLastInitialSpace: (value)=>setLastInitialSpace(value),
                        setFirstInitialSpace: (value)=>setFirstInitialSpace(value),
                        setFormIdentical: (value)=>setFormIdentical(value),
                        getResetFormIdentical
                    }
                }
            />
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    user: state.user,
    transactions: state.transactions,
    accounts: state.accounts
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getClosingJournalFromAPI: (data) => dispatch(getClosingJournalFromAPI(data)),
    getClosingJournalsFromAPI: () => dispatch(getClosingJournalsFromAPI()),
    postClosingJournalToAPI: (data) => dispatch(postClosingJournalToAPI(data)),
    putClosingJournalToAPI: (data) => dispatch(putClosingJournalToAPI(data)),

    getNumberListFromAPI: (data) => dispatch(getNumberListFromAPI(data)),
    postNumberListToAPI: (data) => dispatch(postNumberListToAPI(data)),
    putNumberListToAPI: (data) => dispatch(putNumberListToAPI(data)),
    incrementLastOrderTNFromAPI: (data) => dispatch(incrementLastOrderTNFromAPI(data)),
    getTransNumberFromAPI: (data) => dispatch(getTransNumberFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(CreateUpdateClosingJournal)