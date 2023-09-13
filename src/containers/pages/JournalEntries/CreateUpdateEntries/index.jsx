import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import ModalIdenticalCode from "../../../../components/molecules/ModalIdenticalCode";
import InputValidation from "../../../../components/atoms/InputValidation";
import { ButtonSubmit, ButtonNavigate } from "../../../../components/atoms/ButtonAndLink";
import RowFormEntries from "../../../../components/molecules/RowFormEntries";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getJournalEntryFromAPI, getNumberListFromAPI, getTransNumberFromAPI, incrementLastOrderTNFromAPI, postJournalEntryToAPI, postNumberListToAPI, putJournalEntryToAPI, putNumberListToAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";
import './CreateUpdateEntries.scss'

const CreateUpdateEntries = (props) => {
    const navigate = useNavigate()
    const {search} = useLocation()
    const searchParams = new URLSearchParams(search)
    let duplicate = JSON.parse(searchParams.get('duplicate'))
    let {transId} = useParams()
    !transId && (transId = searchParams.get('transId'))

    const { getCurrency, getFullDateNow, getNormalNumb } = useGeneralFunc()

    const [validation, setValidation] = useState({nominalNull: [], nominalDouble: [], accountNull: []})
    const [isUpdate, setIsUpdate] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [parentAccounts, setParentAccounts] = useState([])
    const [contacts, setContacts] = useState([])
    const [transaction, setTransaction] = useState({
        date: getFullDateNow(),
        contactId: '',
        memo: '',
        transType: "Journal Entries"
    })
    const [transDb, setTransDb] = useState({})
    const [accountTransactions, setAccountTransactions] = useState([
        { account: "", description: "", debit: "", credit: "" }, { account: "", description: "", debit: "", credit: "" }
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
        codeFor: "journalEntries", lastCode: "", codeList: [{ initialCode: "", startFrom: "" }]
    })

    const getResetUpdate = async (dataTransaction) => {
        if(dataTransaction) {
            const {memo, transAccounts, contactId, date, authors} = dataTransaction
            let newTransAccounts = []
            transAccounts.forEach(e => newTransAccounts.push(e))
            let tempTransaction = {...transaction, contactId, memo, authors}

            if(duplicate) setIsDuplicate(true)
            else {
                setTransDb(dataTransaction)
                setIsUpdate(true)
                
                const {tNId, tNParams} = dataTransaction
                const tempNumb = await props.getTransNumberFromAPI({tNId, tNParams, codeFor: 'journalEntries'})
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
        const res = await props.postJournalEntryToAPI(dataReadyToPost)
        if(res) {
            navigate(`/journal-entries/transaction-detail/${res}`)
            const tempNumb = await props.getTransNumberFromAPI({tNId, tNParams, codeFor})
            Swal.fire({
                title: 'Good job!',
                text: `${dataReadyToPost.transType} #${tempNumb} created`,
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
        const res = await props.putJournalEntryToAPI(dataReadyToUpdate)
        if(res) {
            navigate(`/journal-entries/transaction-detail/${transDb.id}`)
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
                await putDataToAPI({
                    ...newTransaction,
                    id: transDb.id,
                    // transNumber
                })
                :
                await postDataToAPI(newTransaction)
            }
        }
        else lostConnection()
    }

    const getNewTransNumber = async () => {
        const {initialCode, startFrom} = identicalCode
        let numberList = []
        initialCode ?
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
        navigate(temp ? `/journal-entries/transaction-detail/${transId}` : '/journal-entries')
    }

    const getJournalEntry = async() => {
        const tempTrans = await props.getJournalEntryFromAPI(transId)
        if(tempTrans) getResetUpdate(tempTrans)
        else {
            Swal.fire({
                title: 'No Available!',
                text: 'You are trying to access unavailable data',
                icon: 'warning',
                confirmButtonColor: '#fd7e14'
            })
            navigate('/journal-entries')
        }
    }
    useEffect(() => {
        transId && getJournalEntry()
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
        !props.transactions.journalEntries && props.getJournalEntriesFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.transactions.journalEntries
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
    let numbPlaceHolder = isUpdate ? '' : `${lastCode === 'defaultCode' ? '' : lastCode+'.'}[auto]`
    const {nominalNull, nominalDouble, accountNull} = validation

    return (
        <LayoutsMainContent>
            <ContentHeader name={isUpdate ? 'Edit Transaction' : 'New Transaction'}/>
            {/* Entry Content */}
            <div className="card pb-5 create-update-entries">
                <div className="card-header">
                    Journal Entries
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-2">
                            <label htmlFor="contactId" className="form-label mb-0">Contact</label>
                            <select className="form-select form-select-sm" id="contactId" value={transaction.contactId} name="contactId" onChange={handleEntryTransaction}>
                                <option value="">Choose...</option>
                                {contacts.map((contact, i) => <option key={i} value={contact.id}>{contact.name}</option>)}
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
                        <div className="col-sm-6">
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
                                        const formValidation = [ nominalNull[row], nominalDouble[row], accountNull[row] ]
                                        const rowFormFunc= { handleEntryAccount, handleDeleteRow, handleSubmit, setAccountTransactions: (e)=>setAccountTransactions(e) }
                                        const data = { row, account, accounts, description, debit, credit, formValidation, parentAccounts, accountTransactions }
                                        return <RowFormEntries key={row} rowFormFunc={rowFormFunc} data={data}/>
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
    getJournalEntryFromAPI: (data) => dispatch(getJournalEntryFromAPI(data)),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    postJournalEntryToAPI: (data) => dispatch(postJournalEntryToAPI(data)),
    putJournalEntryToAPI: (data) => dispatch(putJournalEntryToAPI(data)),

    getNumberListFromAPI: (data) => dispatch(getNumberListFromAPI(data)),
    postNumberListToAPI: (data) => dispatch(postNumberListToAPI(data)),
    putNumberListToAPI: (data) => dispatch(putNumberListToAPI(data)),
    incrementLastOrderTNFromAPI: (data) => dispatch(incrementLastOrderTNFromAPI(data)),
    getTransNumberFromAPI: (data) => dispatch(getTransNumberFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(CreateUpdateEntries)