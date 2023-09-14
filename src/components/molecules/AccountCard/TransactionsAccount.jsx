import React, { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import { connect } from "react-redux";
import { getAllNumberListFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../config/redux/action";

const TransactionsAccount = (props) => {
    const {accountId} = useParams()
    const { getCurrency } = useGeneralFunc()
    const [transactions, setTransactions] = useState([])
    const [contacts, setContacts] = useState([])
    const [nLReceiptJournal, setNLReceiptJournal] = useState()
    const [nLPaymentJournal, setNLPaymentJournal] = useState()
    const [nLJournalEntries, setNLJournalEntries] = useState()

    useEffect(() => {
        props.contacts.length === 0 && props.getContactsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.contacts
        temp.length > 0 && setContacts(temp)
    }, [props.contacts])

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
        let trans = []
        const temp1 = props.transactions.openingBalance,
        temp1url = '/opening-balance',
        temp = [
            {trans: props.transactions.receiptJournal, surl: '/receipt-journal/transaction-detail/'},
            {trans: props.transactions.paymentJournal, surl: '/receipt-journal/transaction-detail/'},
            {trans: props.transactions.journalEntries, surl: '/journal-entries/transaction-detail/'},
        ]
        
        temp.forEach(a =>
            a.trans && a.trans.forEach(e =>
                e.transAccounts.forEach(acc => acc.account === accountId && trans.push({...e, surl: a.surl + e.id}))
            )
        )

        trans.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
        temp1 && temp1.forEach(e =>
            e.transAccounts.forEach(acc => acc.account === accountId && trans.unshift({...e, surl: temp1url}))
        )
        trans.length > 0 && setTransactions(trans)
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
    const { balance } = props.dataTrans.account
    let total = 0
    return (
        <Fragment>
            {
                transactions.length > 0 ?
                <div className="table-responsive">
                    <table className="table table-striped table-sm table-transaction-account">
                        <thead>
                            <tr>
                                <th scope="col" className="tabel-date ps-2">Date</th>
                                <th scope="col">Contact</th>
                                <th scope="col">Description</th>
                                <th scope="col" className="text-end">Debit</th>
                                <th scope="col" className="text-end">Credit</th>
                                <th scope="col" className="text-end pe-2">Total</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {
                                transactions.map(transaction => {
                                    let { id, contactId, transAccounts, memo, date, tNId, tNParams, transType, surl } = transaction
                                    let contact = contacts.find(e => contactId === e.id)
                                    let debit = 0, credit = 0
                                    
                                    // transAccounts.length > 0 &&
                                    transAccounts.forEach(trans => {
                                        if(trans.account === accountId) {
                                            debit += trans.debit
                                            credit += trans.credit
                                        }
                                    })
                                    total = balance === 'debit' ? total + debit - credit : total - debit + credit
                                    return (
                                        <tr key={id}>
                                            <td className="ps-2">{date.split('-').reverse().join('/')}</td>
                                            <td>
                                                <Link to={`/contacts/detail/${contactId}`} className="contact-name-transaction">
                                                    {contact && contact.name}
                                                </Link>
                                            </td>
                                            <td className="pb-2">
                                                <p className="mb-0 fw-normal">
                                                    <Link to={`${surl}`} className="number-transaction">
                                                        {getTransNumber(tNId, tNParams, transType)}
                                                    </Link>
                                                </p>
                                                <p className="mb-0 fw-light description">{memo}</p>
                                            </td>
                                            <td className="text-end">{getCurrency(debit)}</td>
                                            <td className="text-end">{getCurrency(credit)}</td>
                                            {
                                                total < 0 ?
                                                <td className="text-end fw-bold pe-1">{`(${getCurrency(total)})`}</td>
                                                :
                                                <td className="text-end fw-bold pe-2">{getCurrency(total)}</td>
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
                :
                <p className="pt-3">There is no transaction...</p>
            }
        </Fragment>
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
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getAllNumberListFromAPI: (data) => dispatch(getAllNumberListFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(TransactionsAccount)