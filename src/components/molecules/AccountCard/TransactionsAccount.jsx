import React, { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import { connect } from "react-redux";
import { getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";

const TransactionsAccount = (props) => {
    const {accountId} = useParams()
    const { getCurrency } = useGeneralFunc()

    const [transactions, setTransactions] = useState([])
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        setContacts(props.contacts)
    }, [props.contacts])
    
    useEffect(() => {
        props.getContactsFromAPI()
    }, [])

    const getTransactions = async() => {
        let trans = []
        const temp1 = props.transactions.journalEntries
        const journalEntries = temp1 ? temp1 : await props.getJournalEntriesFromAPI()
        journalEntries.forEach(e => {
            e.transAccounts.forEach(acc => {
                acc.account === accountId &&
                trans.push({
                    ...e,
                    surl:`/journal-entries/transaction-detail/${e.id}`
                })
            })
        })
        const temp2 = props.transactions.paymentJournal
        const paymentJournal = temp2 ? temp2 : await props.getPaymentJournalsFromAPI()
        paymentJournal.forEach(e => {
            e.transAccounts.forEach(acc => {
                acc.account === accountId &&
                trans.push({
                    ...e,
                    surl:`/payment-journal/transaction-detail/${e.id}`
                })
            })
        })
        const temp3 = props.transactions.receiptJournal
        const receiptJournal = temp3 ? temp3 : await props.getReceiptJournalsFromAPI()
        receiptJournal.forEach(e => {
            e.transAccounts.forEach(acc => {
                acc.account === accountId &&
                trans.push({
                    ...e,
                    surl:`/receipt-journal/transaction-detail/${e.id}`
                })
            })
        })
        const temp4 = props.transactions.openingBalance
        const openingBalance = temp4 ? temp4 : await props.getOpeningBalanceFromAPI()
        openingBalance.forEach(e => {
            e.transAccounts.forEach(acc => {
                acc.account === accountId &&
                trans.push({
                    ...e,
                    surl:'/opening-balance'
                })
            })
        })

        trans.sort((a, b) => 
            a.transNumber < b.transNumber ? -1 :
            a.transNumber > b.transNumber ? 1 : 0
        )
        trans.sort((a, b) => 
            a.date < b.date ? -1 :
            a.date > b.date ? 1 : 0
        )
        trans.length > 0 && setTransactions(trans)
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])

    const { balance } = props.dataTrans.account
    let total = 0
    return (
        <Fragment>
            <div className="table-responsive-sm">
                <table className="table table-striped table-sm table-transaction-account">
                    <thead>
                        <tr>
                            <th scope="col" className="tabel-date">Date</th>
                            <th scope="col">Contact</th>
                            <th scope="col">Description</th>
                            <th scope="col" className="text-end">Debit</th>
                            <th scope="col" className="text-end">Credit</th>
                            <th scope="col" className="text-end">Total</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {
                            transactions.map(transaction => {
                                let { id, contactId, transAccounts, memo, date, transNumber, transType, surl } = transaction
                                contactId = contactId
                                let contact = contacts.find(e => contactId === e.id)
                                let debit = 0, credit = 0
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
                                                    {transType} #{transNumber}
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
        </Fragment>
    )
}

const reduxState = (state) => ({
    contacts: state.contacts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI())
})

export default connect(reduxState, reduxDispatch)(TransactionsAccount)