import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './CreateUpdateEntries.css'

import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import ModalIdenticalCode from "../../../../components/molecules/ModalIdenticalCode";
import InputValidation from "../../../../components/atoms/InputValidation";
import { ButtonSubmit, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import { useAccountFunc, useGeneralFunc, useIdenticalFunc, useJournalEntriesFunc } from "../../../../utils/MyFunction/MyFunction";
import RowFormEntries from "../../../../components/molecules/RowFormEntries";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getContactsFromAPI, getEntriesFromAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";

const CreateUpdateEntries = (props) => {
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let duplicate = searchParams.get('duplicate')
    let {transId} = useParams()
    transId = transId ? transId : searchParams.get('transId')

    const { getCurrency, getFullDateNow, getNormalNumb, updateProps } = useGeneralFunc()

    const { getAccGroup } = useAccountFunc()
    const { postEntriesAPI, putEntriesAPI, getEntriesTransaction } = useJournalEntriesFunc()
    const { getIdenticalCode } = useIdenticalFunc()

    const [validation, setValidation] = useState({nominalNull: [], nominalDouble: [], accountNull: []})
    const [isUpdate, setIsUpdate] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [contacts, setContacts] = useState([])
    const [transaction, setTransaction] = useState({ date: '2023-01-01', contactId: "", memo: "" })
    const [transDb, setTransDb] = useState({})
    const [accountTransactions, setAccountTransactions] = useState([])
    const [transNumber, setTransNumber] = useState('')
    const [transNumberList, setTransNumberList] = useState([])
    
    const [transNumberAvailable, setTransNumberAvailable] = useState(true)
    const [identicalAvailable, setIdenticalAvailable] = useState(true)
    const [lastInitialDigit, setLastInitialDigit] = useState(false)

    const [showFormIdentic, setShowFormIdentic] = useState(false)
    const [formIdentical, setFormIdentical] = useState({ initialCode:'', startFrom:'' })
    const [identicalCode, setIdenticalCode] = useState({
        id: "", codeFor: "Journal Entries", initialCode: "", startFrom: "", codeList: [{ initialCode: "", startFrom: "" }]
    })

    const getAccounts = async () => {
        let {newAccounts, newParentAccounts} = await getAccGroup()
        newAccounts = newAccounts.filter(e => e.isActive === true)
        newParentAccounts.forEach((e, i) => {
            let temp = newAccounts.find(acc => e.id === acc.parentId)
            if(!temp || !e.isActive) newParentAccounts.splice(i,1)
        })
        setAccounts(newAccounts)
        setParentAccounts(newParentAccounts)
    }

    const getResetTransaction = async () => {
        const date = getFullDateNow()
        let trans = {
            date,
            userId: '',
            memo: '',
            transType: "Journal Entries"
        }
        let newTransAccounts = [{ account: "", description: "", debit: "", credit: "" }, { account: "", description: "", debit: "", credit: "" }]
        
        if(transId) {
            getAccounts()
            let newTransaction = await getEntriesTransaction(transId)
            const {memo, transAccounts, contactId, date} = newTransaction
            trans.memo = memo
            newTransAccounts = transAccounts
            contactId && updateProps(trans, {contactId})

            if(duplicate) {
                setIsDuplicate(true)
            } else {
                setTransDb(newTransaction)
                setIsUpdate(true)
                trans.date = date
                setTransNumber(newTransaction.transNumber)
            }
        }
        setTransaction(trans)
        setAccountTransactions(newTransAccounts)

        transId && handleCurrency(newTransAccounts)
        // const {newTransNumbers} = await getEntriesAPI()
        // setTransNumberList(newTransNumbers)
    }

    const getResetFormIdentical = () => {
        setFormIdentical({ initialCode:'', startFrom:'' })
    }

    const handleEntryTransaction = (data) => {
        let newTransaction = {...transaction}
        const {name, value} = data.target
        name === 'userId' || name === 'contactId' ? newTransaction[name] = +value : newTransaction[name] = value
        if(name === 'contactId') value < 1 && delete newTransaction[name]
        setTransaction(newTransaction)
    }

    const handleEntryTransNumber = (data) => {
        let newValidation = {...validation}
        let newTransNumber = data.target.value
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

    const handleFocusAccount = () => {
        getAccounts()
    }

    const handleEntryAccount = (data) => {
        let newAccountTransactions = [...accountTransactions]
        let {name, value, id} = data.target
        let idNumb = +id.slice(3)
        name === 'debit' || name === 'credit' || name === 'account' ?
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
                    alert('Tidak ada akun, transaksi tidak dapat diproses!!') :
                    alert('Hanya satu akun, transaksi tidak dapat diproses!!')
            } else if (totalDebit !== totalCredit) {
                accountProblem = true
                alert('Debit and credit unmatch!!')
            }
        } 
        if(transNumber) {
            // const { newTransNumbers } = await getEntriesAPI()
            let numbExist = transNumberList.find(e => e === transNumber)
            if(isUpdate) {
                if(numbExist === transDb.transNumber) numbExist = undefined
            }
            if (numbExist) {
                setTransNumberAvailable(false)
                accountProblem = true
            }
        } else if(isUpdate) {
            accountProblem = true
            newValidation.numberNull = true
        }

        accountProblem && await handleCurrency(newAccountTransactions)

        for( let x in rowValidation ) { newValidation[x] = rowValidation[x] }
        setValidation(newValidation)
        return {accountProblem, newAccountTransactions}
    }

    const postDataToAPI = async (newTransaction) => {
        const {id, transNumber} = await postEntriesAPI(newTransaction)
        navigate(`/journal-entries/transaction-detail/${id}`)
        setTimeout(()=> {
            alert(`Berhasil menambahkan transaksi ${transNumber} ke daftar journal entries`)
        }, 600)
    }
    
    const putDataToAPI = async (newTransaction) => {
        const {id, transNumber} = await putEntriesAPI(newTransaction)
        navigate(`/journal-entries/transaction-detail/${id}`)
        setTimeout(()=> {
            alert(`Berhasil memperbaharui transaksi ${transNumber} pada journal entries`)
        }, 600)
    }

    const handleSubmit = async () => {
        let {accountProblem, newAccountTransactions} = await getAccountValidation()
        if(!accountProblem) {
            let newTransaction = {...transaction}
            newTransaction.userId = 1 // nanti disesuaikan lagi USER nya
            newTransaction.transAccounts = newAccountTransactions.filter(e => e.account)
            if(isUpdate) {
                updateProps(newTransaction, {transNumber, id: transDb.id})
                // await putDataToAPI(newTransaction)
            } else {
                newTransaction.transNumber = transNumber ? transNumber : await getNewTransNumber()
                // await postDataToAPI(newTransaction)
            }
        }
    }

    const getNewTransNumber = async () => {
        // const { newTransNumbers } = await getEntriesAPI()
        const {initialCode, startFrom} = await getIdenticalCode()
        let numberList = []
        if(initialCode) {
            transNumberList.forEach(e => {
                let temp = +e.slice(initialCode.length).replace('.', ' ').replace(',', ' ')
                if(e.startsWith(initialCode)) { temp % 1 === 0 && numberList.push(temp) }
            })
        }
        if(!initialCode) transNumberList.forEach(e => +e.transNumber % 1 === 0 && numberList.push(+e.transNumber) )

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
        getResetFormIdentical()
    }

    useEffect(() => {
        getResetTransaction()
        props.getContactsFromAPI()
        props.getEntriesFromAPI()
    }, [])
    
    useEffect(() => {
        let temp = props.contacts.filter(e => e.isActive === true)
        setContacts(temp)
    }, [props.contacts])

    useEffect(() => {
        let newTransNumbers = []
        for(let x in props.transactions) {
            if( x === 'journalEntries' ) {
                props.transactions[x].forEach(e => newTransNumbers.push(e.transNumber))
            }
        }
        setTransNumberList(newTransNumbers)
    }, [props.transactions])
    
    const {initialCode} = identicalCode
    let numbPlaceHolder = isUpdate ? '' : `${initialCode}[auto]`
    const {nominalNull, nominalDouble, accountNull} = validation

    return (
        <LayoutsMainContent>
            <ContentHeader name={isUpdate ? 'Edit Transaction' : 'New Transaction'}/>
            {/* Entry Content */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" style={{display: "none"}}>
                <symbol id="gear-wide-connected" viewBox="0 0 16 16">
                    <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434l.071-.286zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5zm0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78h4.723zM5.048 3.967c-.03.021-.058.043-.087.065l.087-.065zm-.431.355A4.984 4.984 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8 4.617 4.322zm.344 7.646.087.065-.087-.065z"/>
                </symbol>
            </svg> */}
            <div className="card pb-5">
                <div className="card-header">
                    Journal Entries
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2">
                            <label htmlFor="contactId" className="form-label mb-0">Contact</label>
                            <select className="form-select form-select-sm" id="contactId" value={transaction.contactId} name="contactId" onChange={handleEntryTransaction}>
                                <option value="">Choose...</option>
                                { contacts.map((contact, i) => <option key={i} value={contact.id}>{contact.name}</option>) }
                            </select>
                        </div>
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
                                    <svg className="bi trans-number-setting" data-bs-toggle="modal" data-bs-target="#exampleModal"><use xlinkHref="#gear-wide-connected"/></svg>
                                </div>
                            }
                            </div>
                            <input type="text" className={`form-control form-control-sm me-1 ${!transNumberAvailable && 'border-danger'}`} id="transNumber" name="transNumber" onChange={handleEntryTransNumber} placeholder={numbPlaceHolder} autoComplete="off" value={transNumber} />
                            { !transNumberAvailable && <InputValidation name="not available, number already exist"/> }
                            { validation.numberNull && <InputValidation name="number null"/> }
                        </div>
                        <div className="col-sm-6">
                            <label htmlFor="memo" className="form-label mb-0">Memo</label>
                            <textarea className="form-control form-control-sm" id="memo" name="memo" rows="4" onChange={handleEntryTransaction} value={transaction.memo} />
                        </div>
                    </div>
                    <div className="mb-5">
                        <table className="table table-borderless">
                            <thead>
                                <tr>
                                    <th className="text-start">Account</th>
                                    <th className="text-start ps-3">Description</th>
                                    <th className="text-end pe-3">Debit</th>
                                    <th className="text-end pe-3">Credit</th>
                                    <th>
                                        <button className="btn btn-outline-success btn-sm delete-row add-row" onClick={handleAddRow}>+</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    accountTransactions.map((trans, row)=> {
                                        const {account, description, debit, credit} = trans
                                        const formValidation = [ nominalNull[row], nominalDouble[row], accountNull[row] ]
                                        const rowFormFunc= { handleEntryAccount, handleDeleteRow, handleFocusAccount, handleSubmit, setAccountTransactions: (e)=>setAccountTransactions(e) }
                                        const data = { row, account, accounts, description, debit, credit, formValidation, parentAccounts, accountTransactions }
                                        return <RowFormEntries key={row} rowFormFunc={rowFormFunc} data={data}/>
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <ButtonSubmit handleOnClick={handleSubmit} isUpdate={isUpdate} color="outline-primary"/>
                    &nbsp;&nbsp;&nbsp;
                    <ButtonLinkTo name="Cancel" linkTo={isUpdate || isDuplicate? `/journal-entries/transaction-detail/${transId}` : '/journal-entries'} color="outline-danger"/>
                </div>
            </div>

            {/* Modal */}
            <ModalIdenticalCode 
                data={{identicalCode, showFormIdentic, formIdentical, identicalAvailable, lastInitialDigit}} 
                identicalState={{
                    setIdentical: (value)=>setIdenticalCode(value), setAvailable: (value)=>setIdenticalAvailable(value), setShowForm: (value)=>setShowFormIdentic(value),
                    setLastInitialDigit: (value)=>setLastInitialDigit(value), setFormIdentical: (value)=>setFormIdentical(value), getResetFormIdentical
                }}
            />
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    contacts: state.contacts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getEntriesFromAPI: () => dispatch(getEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(CreateUpdateEntries)