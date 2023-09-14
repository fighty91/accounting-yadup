import React, { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import ContactCard from "../../../components/molecules/ContactCard";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getAllNumberListFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../config/redux/action";
import './Contacts.scss'

const TransactionsContact = (props) => {
    let { contactId } = useParams();
    const { getCurrency } = useGeneralFunc()
    const [contact, setContact] = useState({})
    const [positions, setPositions] = useState({})
    const [transactions, setTransactions] = useState([])
    const [nLReceiptJournal, setNLReceiptJournal] = useState()
    const [nLPaymentJournal, setNLPaymentJournal] = useState()
    const [nLJournalEntries, setNLJournalEntries] = useState()

    const getTransNumber = (tNId, tNParams, transType) => {
        let temp, params = '#'
        switch (transType) {
            case 'Receipt Journal':
                nLReceiptJournal && nLReceiptJournal[tNParams].find(e => e.id === tNId && (temp = e.transNumber))
                break;
            case 'Payment Journal':
                nLPaymentJournal && nLPaymentJournal[tNParams].find(e => e.id === tNId && (temp = e.transNumber))
                break;
            case 'Journal Entries':
                nLJournalEntries && nLJournalEntries[tNParams].find(e => e.id === tNId && (temp = e.transNumber))
                break;
            case 'Opening Balance':
                temp = 10001
                break;
            default:
                break;
        }
        if(tNParams !== 'defaultCode') params = '#' + tNParams + '.'
        const showNumber = `${transType} ${params+temp}`
        return showNumber
    }

    const getContact = () => {
        const newContact = props.contacts.find(e => e.id === contactId)
        if(newContact) {
            setContact(newContact)
            setPositions(newContact.position)
        }
    }
    useEffect(() => {
        props.contacts.length < 1 && props.getContactsFromAPI()
    },[])
    useEffect(() => {
        props.contacts.length > 0 && getContact()
    },[props.contacts])

    const getTransactionsProps = async() => {
        !props.transactions.openingBalance && await props.getOpeningBalanceFromAPI()
        !props.transactions.receiptJournal && await props.getReceiptJournalsFromAPI()
        !props.transactions.paymentJournal && await props.getPaymentJournalsFromAPI()
        !props.transactions.journalEntries && await props.getJournalEntriesFromAPI()
    }
    useEffect(() => {
        getTransactionsProps()
    }, [])
    const getTransactions = async() => {
        let tempTrans = []
        const temp = [
            {trans: props.transactions.receiptJournal, surl: '/receipt-journal/transaction-detail/'},
            {trans: props.transactions.paymentJournal, surl: '/payment-journal/transaction-detail/'},
            {trans: props.transactions.journalEntries, surl: '/journal-entries/transaction-detail/'},
        ],
        tempOB = props.transactions.openingBalance,
        urlOB = '/opening-balance'

        temp.forEach(a =>
            a.trans && a.trans.forEach(acc =>
                acc.contactId === contactId && tempTrans.push({...acc, surl: a.surl + acc.id})
            )
        )
        tempTrans.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
        tempOB && tempOB.forEach(acc =>
            acc.contactId === contactId && tempTrans.unshift({...acc, surl: urlOB})
        )
        tempTrans.length > 0 && setTransactions(tempTrans)
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])

    useEffect(() => {
        let arrCodeFor = {receiptJournal: 'nLReceiptJournal', paymentJournal: 'nLPaymentJournal', journalEntries: 'nLJournalEntries'}
        for(let e in arrCodeFor) {
            let temp = props[arrCodeFor[e]], tempCount = 0
            for(let x in temp) {x && tempCount++}
            tempCount < 1 && props.getAllNumberListFromAPI(e)
        }
    }, [])
    useEffect(() => {
        const temp = props.nLReceiptJournal
        let countTemp = 0
        for(let x in temp) { x && countTemp++ }
        countTemp > 0 && setNLReceiptJournal(temp)
    }, [props.nLReceiptJournal])
    useEffect(() => {
        const temp = props.nLPaymentJournal
        let countTemp = 0
        for(let x in temp) { x && countTemp++ }
        countTemp > 0 && setNLPaymentJournal(temp)
    }, [props.nLPaymentJournal])
    useEffect(() => {
        const temp = props.nLJournalEntries
        let countTemp = 0
        for(let x in temp) { x && countTemp++ }
        countTemp > 0 && setNLJournalEntries(temp)
    }, [props.nLJournalEntries])

    const getPosition = () => {
        let newPositions = []
        const temp = [
            {name: 'vendor', color: 'danger'},
            {name: 'customer', color: 'success'},
            {name: 'employee', color: 'primary'},
            {name: 'other', color: 'secondary'},
        ]
        for(let x in positions) {
            if(positions[x] === true) {
                const posName = x.charAt(0).toUpperCase() + x.slice(1);
                temp.find(e => e.name === x && newPositions.push({name: posName, color: e.color}))
            } 
        }
        return newPositions
    }
    
    const {name, id} = contact
    const newPositions = getPosition()
    
    return(
        <LayoutsMainContent>
            <ContentHeader name="Information"/>

            <ContactCard contactId={id} transactionsActive="active" newPositions={newPositions} name={name}>
                <div className="card-text mb-4">
                    {
                        transactions.length > 0 ?
                        <div className="table-responsive">
                            <table className="table table-striped table-sm table-transaction">
                                <thead>
                                    <tr>
                                        <th scope="col" className="tabel-date">Date</th>
                                        <th scope="col">Description</th>
                                        <th scope="col" className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {
                                        transactions.map(trans => {
                                            const {date, transType, tNId, tNParams, memo, transAccounts} = trans
                                            let amount = 0
                                            transAccounts.forEach(e => amount += e.debit)
                                            return (
                                                <tr key={trans.id}>
                                                    <td>{date.split('-').reverse().join('/')}</td>
                                                    <td className="pb-2">
                                                        <p className="mb-0 fw-normal">
                                                            <Link to={trans.surl} className="number-transaction">
                                                                {/* {transType} #{transNumber} */}
                                                                {getTransNumber(tNId, tNParams, transType)}
                                                            </Link>
                                                        </p>
                                                        <p className="mb-0 fw-light description">{memo || 'no description'}</p>
                                                    </td>
                                                    <td className="text-end pe-2">{getCurrency(amount)}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                        :
                        <p>There is no transaction...</p>
                    }
                </div>
            </ContactCard>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    contacts: state.contacts,
    transactions: state.transactions,
    nLReceiptJournal: state.nLReceiptJournal,
    nLPaymentJournal: state.nLPaymentJournal,
    nLJournalEntries: state.nLJournalEntries
})
const reduxDispatch = (dispatch) => ({
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getAllNumberListFromAPI: (data) => dispatch(getAllNumberListFromAPI(data)),
})

export default connect(reduxState, reduxDispatch)(TransactionsContact)