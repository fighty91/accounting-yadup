import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import ModalIdenticalCode from "../../../../components/molecules/ModalIdenticalCode";
import InputValidation from "../../../../components/atoms/InputValidation";
import { ButtonSubmit, ButtonNavigate } from "../../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getContactsFromAPI, getReceiptJournalsFromAPI, getReceiptJournalFromAPI, postReceiptJournalToAPI, putReceiptJournalToAPI, getNumberListFromAPI, postNumberListToAPI, putNumberListToAPI, incrementLastOrderTNFromAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";
import RowFormReceiptJournal from "../../../../components/molecules/RowFormReceiptJournal";
import './CreateUpdateReceiptJournal.scss'

const CreateUpdateReceiptJournal = (props) => {
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let duplicate = JSON.parse(searchParams.get('duplicate'))
    let {transId} = useParams()
    !transId && (transId = searchParams.get('transId'))
    const { getCurrency, getCurrencyAbs, getFullDateNow, getNormalNumb } = useGeneralFunc()

    const [validation, setValidation] = useState({nominalNull: [], accountNull: []})
    const [isUpdate, setIsUpdate] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [contacts, setContacts] = useState([])
    const [transaction, setTransaction] = useState({
        date: getFullDateNow(),
        contactId: '',
        memo: '',
        transType: "Receipt Journal"
    })
    const [transDb, setTransDb] = useState({})
    const [accountTransactions, setAccountTransactions] = useState([
        { account: "", description: "", debit: 0, credit: "" },
        { account: "", description: "", debit: 0, credit: "" }
    ])
    const [receiptAccount, setReceiptAccount] = useState({ account: "", description: "", debit: 0, credit: 0 })
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
        codeFor: "receiptJournal", lastCode: '',
        initialCode: "", startFrom: "", codeList: [{ initialCode: "", startFrom: "" }]
    })

    const getResetUpdate = async (dataTransaction) => {
        if(dataTransaction) {
            const {memo, transAccounts, contactId, date, authors} = dataTransaction
            let newTransAccounts = []
            transAccounts.forEach(e => e.debit ? setReceiptAccount(e) : newTransAccounts.push(e))
            let tempTransaction = {...transaction, contactId, memo, authors}

            if(duplicate) setIsDuplicate(true)
            else {
                setTransDb(dataTransaction)
                setIsUpdate(true)
                setTransNumber(dataTransaction.transNumber)
                tempTransaction.date = date
            }
            setTransaction(tempTransaction)
            handleCurrency(newTransAccounts)
        }
    }

    const getResetFormIdentical = () => {
        setFormIdentical({ initialCode:'', startFrom:'' })
        // periksa kembali
    }

    const handleChangeReceiptAccount = (e) => {
        const newReceiptAccount = {
            ...receiptAccount,
            [e.target.name]: e.target.value
        }
        setReceiptAccount(newReceiptAccount)
    }

    const handleEntryTransaction = (e) => {
        let newTransaction = {
            ...transaction,
            [e.target.name]: e.target.value
        }
        setTransaction(newTransaction)
    }

    const handleEntryTransNumber = (e) => {
        let newValidation = {...validation}
        let newTransNumber = e.target.value
        let numbExist = transNumberList.find(e => e === newTransNumber) 
        if(isUpdate) {
            if(numbExist === transDb.transNumber) numbExist = undefined
            if(newTransNumber) {
                delete newValidation.numberNull
                setValidation(newValidation)
            }
        }
        setTransNumberAvailable(numbExist ? false : true)
        setTransNumber(newTransNumber)
    }

    const handleAddRow = () => {
        let newAccountTransactions = [...accountTransactions]
        const accountTransaction = { account: "", description: "", debit: 0, credit: "" }
        newAccountTransactions.push(accountTransaction)
        setAccountTransactions(newAccountTransactions)
    }

    const handleDeleteRow = (rowIndex) => {
        let newAccountTransactions = [...accountTransactions]
        if(accountTransactions.length > 1) {
            newAccountTransactions.splice(rowIndex, 1)
            setAccountTransactions(newAccountTransactions)
        }
    }

    const handleEntryAccount = (e) => {
        let newAccountTransactions = [...accountTransactions]
        let {name, value, id} = e.target
        let idNumb = +id.slice(3)
        name === 'credit' ?
        newAccountTransactions[idNumb][name] = +value :
        newAccountTransactions[idNumb][name] = value
        setAccountTransactions(newAccountTransactions)
    }

    // untuk submit
    const handleNormalNumb = () => {
        let newAccountTransactions = [...accountTransactions]
        newAccountTransactions.forEach((acc) =>
            acc.credit = getNormalNumb(acc.credit)
        )
        setAccountTransactions(newAccountTransactions)
        return newAccountTransactions
    }

    const handleCurrency = (newAccountTransactions) => {
        newAccountTransactions.forEach((acc, i) => {
            const {credit} = acc
            acc.credit = getCurrency(credit)
        })
        setAccountTransactions(newAccountTransactions)
    }
    
    const countValidation = async () => {
        let totalCredit = 0, transCount = 0
        let accountProblem = false
        let rowValidation = {nominalNull: [], accountNull: []}

        let newAccountTransactions = [...handleNormalNumb()]
        newAccountTransactions.forEach((trans, i) => {
            let tempCount = {nominalNull: 0, accountNull: 0}
            const {credit} = trans
            if(trans.account) {
                transCount++
                if(credit === 0) { 
                    tempCount.nominalNull++
                    accountProblem = true 
                } else { 
                    totalCredit += credit
                }
            }
            else if(credit !== 0) { 
                tempCount.accountNull++
                accountProblem = true 
            }
            for( let x in rowValidation ) {
                rowValidation[x].push(
                    tempCount[x] > 0 ? true : false
                ) 
            }
        })
        return {totalCredit, transCount, accountProblem, rowValidation, newAccountTransactions}
    }

    const getAccountValidation = async () => {
        let {totalCredit, transCount, accountProblem, rowValidation, newAccountTransactions} = await countValidation()
        let newValidation = {...validation}

        newValidation.receiptAccountNull = false
        if(!receiptAccount.account) {
            accountProblem = true
            newValidation.receiptAccountNull = true
        }
        if (!accountProblem) {
            if (transCount < 1) {
                accountProblem = true
                Swal.fire({
                    title: 'Pending!',
                    text: 'There is no transaction account, the transaction cannot be processed!!',
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            }
        } 
        if(transNumber) {
            let numbExist = transNumberList.find(e => e === transNumber)
            if(isUpdate) {
                if(numbExist === transDb.transNumber) numbExist = undefined
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

        for(let x in rowValidation) {
            newValidation[x] = rowValidation[x]
        }
        setValidation(newValidation)
        
        return {accountProblem, newAccountTransactions, totalCredit}
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
                // temp.sort((a, b) => a.createdAt - b.createdAt)
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
        const numberId = await props.postNumberListToAPI({tempNumber, tNParams, codeFor})
        await checkPostNL(tempNumber)
        
        let authors = [{
            createdBy: props.user.uid2,
            createdAt: Date.now()
        }],
        dataReadyToPost = {
            ...newTransaction, authors,
            tNId: numberId, tNParams: tNParams
        }
        const res = await props.postReceiptJournalToAPI(dataReadyToPost)
        
        if(res) {
            navigate(`/receipt-journal/transaction-detail/${res}`)
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
        const res = await props.putReceiptJournalToAPI(dataReadyToUpdate)
        if(res) {
            navigate(`/receipt-journal/transaction-detail/${transDb.id}`)
            Swal.fire({
                title: 'Nice!',
                text: `${newTransaction.transType} #${transNumber} updated`,
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
            let {accountProblem, newAccountTransactions, totalCredit} = await getAccountValidation()
            if(!accountProblem) {
                let newReceiptAccount = {
                    ...receiptAccount,
                    debit: totalCredit
                }
                let transAccounts = [newReceiptAccount]
                newAccountTransactions.forEach(e =>
                    e.account && e.credit > 0 && transAccounts.push(e)
                )
                let newTransaction = {
                    ...transaction, transAccounts
                }
                for(let i in newTransaction) {
                    !newTransaction[i] && delete newTransaction[i]
                }
                isUpdate ?
                await putDataToAPI({...newTransaction, transNumber, id: transDb.id}) :
                await postDataToAPI(newTransaction)
            }
        }
        else lostConnection()
    }

    const getNewTransNumber = async () => {
        const {initialCode, startFrom} = identicalCode
        // let dbNumberList = await props.getNumberListFromAPI()
        let numberList = []
        initialCode ?
        // dbNumberList.forEach(e => {
        //     let temp = +e.slice(initialCode.length).replace('.', ' ').replace(',', ' ')
        //     if(e.startsWith(initialCode)) temp % 1 === 0 && numberList.push(temp)
        // }) :
        // dbNumberList.forEach(e => +e.transNumber % 1 === 0 && numberList.push(+e.transNumber))
        transNumberList.forEach(e => {
            let temp = +e.slice(initialCode.length).replace('.', ' ').replace(',', ' ')
            if(e.startsWith(initialCode)) temp % 1 === 0 && numberList.push(temp)
        }) :
        transNumberList.forEach(e => +e.transNumber % 1 === 0 && numberList.push(+e.transNumber))

        let lastOrder = Math.max(...numberList)
        let newOrder = lastOrder > -1 ? lastOrder + 1 : 1
        if(startFrom > newOrder) newOrder = startFrom
        let newTransNumber = initialCode + newOrder
        return newTransNumber
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
        navigate(temp ? `/receipt-journal/transaction-detail/${transId}` : '/receipt-journal')
    }

    const handleTotalAmount = () => {
        let totalAmount = 0
        accountTransactions.forEach(trans => {
            let credit = getNormalNumb(trans.credit)
            if(credit > 0) totalAmount += credit 
        })
        const newReceiptAccount = {
            ...receiptAccount,
            debit: totalAmount
        }
        setReceiptAccount(newReceiptAccount)
    }
    useEffect(() => {
        let pendingCount = 0
        accountTransactions.forEach(trans =>
            typeof trans.credit === 'number' && pendingCount++
        )
        pendingCount < 1 && handleTotalAmount()
    }, [accountTransactions])

    const getReceiptJournal = async () => {
        let dataTransaction = await props.getReceiptJournalFromAPI(transId)
        getResetUpdate(dataTransaction)
    }
    useEffect(() => {
        transId && getReceiptJournal()
    }, [])

    useEffect(() => {
        props.contacts.length === 0 && props.getContactsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.contacts
        if(temp.length > 0) {
            const newContacts = temp.filter(e => e.isActive)
            setContacts(newContacts)
        }
    }, [props.contacts])

    useEffect(() => {
        !props.transactions.receiptJournal && props.getReceiptJournalsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.transactions.receiptJournal
        let newTransNumbers = []
        temp && temp.forEach(e => newTransNumbers.push(e.transNumber))
        setTransNumberList(newTransNumbers)
    }, [props.transactions])

    const getAccounts = () => {
        let newAccounts = []
        let newParentAccounts = []
        props.accounts.forEach(e => e.isParent ?
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
    let numbPlaceHolder = isUpdate ? '' : `${lastCode}.[auto]`
    const {nominalNull, accountNull} = validation

    return (
        <LayoutsMainContent>
            <ContentHeader name={isUpdate ? 'Edit Transaction' : 'New Transaction'}/>
            {/* Entry Content */}
            <div className="card pb-5 create-update-receipt-journal">
                <div className="card-header">
                    Receipt Journal
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-4 d-flex justify-content-between">
                        <div className="col-sm-6 col-md-5 col-lg-3 col-xl-3 mt-3">
                            <label htmlFor="receiveOn" className="form-label mb-0">Receive on</label>
                            <select className={`form-select form-select-sm ${ validation.receiptAccountNull && 'border-danger'}`} id="receiveOn" name="account" value={receiptAccount.account} onChange={handleChangeReceiptAccount}>
                                <option value="">Choose...</option>
                                { 
                                    parentAccounts.map((parentAcc, i) =>
                                        parentAcc.categoryId === '1' &&
                                        <optgroup label={parentAcc.accountName} key={parentAcc.id}>
                                            {
                                                accounts.map(acc => 
                                                    parentAcc.id === acc.parentId &&
                                                    <option key={acc.id} value={acc.id}>{acc.number} &nbsp; {acc.accountName}</option>
                                                )
                                            }
                                        </optgroup>
                                    )
                                }
                            </select>
                            { validation.receiptAccountNull && <InputValidation name="account null"/> }
                        </div>
                        <div className="col-sm-6 col-md-7 col-lg-9 col-xl-9 align-self-end mt-3">
                            <div className="total-amount text-sm-end">
                                <span className="mb-0 text-secondary">Amount</span> <span className="text-primary">
                                    { getCurrencyAbs(receiptAccount.debit) }
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-md-5 col-lg-3 col-xl-3">
                            <label htmlFor="contactId" className="form-label mb-0">Contact</label>
                            <select className="form-select form-select-sm" id="contactId" value={transaction.contactId} name="contactId" onChange={handleEntryTransaction}>
                                <option value="">Choose...</option>
                                { contacts.map((contact, i) => <option key={i} value={contact.id}>{contact.name}</option>) }
                            </select>
                        </div>
                        <div className="col-sm-6 col-md-3 col-lg-2 col-xl-2">
                            <label htmlFor="date" className="form-label mb-0">Date</label>
                            <input type="date" className="form-control form-control-sm" id="date" name="date" onChange={handleEntryTransaction} value={transaction.date} />
                        </div>
                        <div className="col-sm-6 col-md-4 col-lg-2 col-xl-2">
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
                            <input type="text" className={`form-control form-control-sm me-1 ${!transNumberAvailable && 'border-danger'} ${validation.numberNull && 'border-danger'}`} id="transNumber" name="transNumber" onChange={handleEntryTransNumber} placeholder={numbPlaceHolder} autoComplete="off" value={transNumber} />
                            { !transNumberAvailable && <InputValidation name="not available, number already exist"/> }
                            { validation.numberNull && <InputValidation name="number null"/> }
                        </div>
                        <div className="col-sm-6 col-md-8 col-lg-5 col-xl-5">
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
                                    <th className="text-end pe-3 column-credit">Amount</th>
                                    <th>
                                        <button className="btn btn-outline-success btn-sm delete-row add-row" onClick={handleAddRow}>+</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    accountTransactions.map((trans, row)=> {
                                        
                                        const rowFormFunc= { handleEntryAccount, handleDeleteRow, handleSubmit, setAccountTransactions: (e)=>setAccountTransactions(e) }
                                        
                                        const {account, description, credit} = trans
                                        const formValidation = [ nominalNull[row], accountNull[row] ]
                                        
                                        const data = { row, account, accounts, description, credit, formValidation, parentAccounts, accountTransactions }
                                        return <RowFormReceiptJournal key={row} rowFormFunc={rowFormFunc} data={data}/>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <ButtonSubmit handleOnClick={handleSubmit} isUpdate={isUpdate} color="outline-primary"/>
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
    contacts: state.contacts,
    transactions: state.transactions,
    accounts: state.accounts
})
const reduxDispatch = (dispatch) => ({
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getReceiptJournalFromAPI: (data) => dispatch(getReceiptJournalFromAPI(data)),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    postReceiptJournalToAPI: (data) => dispatch(postReceiptJournalToAPI(data)),
    putReceiptJournalToAPI: (data) => dispatch(putReceiptJournalToAPI(data)),
    getNumberListFromAPI: (data) => dispatch(getNumberListFromAPI(data)),
    postNumberListToAPI: (data) => dispatch(postNumberListToAPI(data)),
    putNumberListToAPI: (data) => dispatch(putNumberListToAPI(data)),
    incrementLastOrderTNFromAPI: (data) => dispatch(incrementLastOrderTNFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(CreateUpdateReceiptJournal)