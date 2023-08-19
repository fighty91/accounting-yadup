import React, { useEffect, useState, Fragment } from "react";
import { Link } from 'react-router-dom';
import './JournalEntries.scss'
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import { connect } from "react-redux";
import { getAccountsFromAPI, getContactsFromAPI, getEntriesFromAPI } from "../../../config/redux/action";

const JournalEntries = (props) => {
    const { getCurrency } = useGeneralFunc()

    const [accounts, setAccounts] = useState()
    const [transactions, setTransactions] = useState([])
    const [contacts, setContacts] = useState()

    const getDataAPI = () => {
        props.getEntriesFromAPI()
        props.getContactsFromAPI()
        props.getAccountsFromAPI()
    }
    
    useEffect (() => {
        getDataAPI()
    }, [])

    useEffect(() => {
        setContacts(props.contacts)
    }, [props.contacts])

    useEffect(() => {
        setAccounts(props.accounts)
    }, [props.accounts])

    useEffect(() => {
        let temp = []
        for(let x in props.transactions) {
            if( x === 'journalEntries' ) props.transactions[x].forEach(e => temp.push(e))
        }
        temp.sort((a, b) => {
            const dateA = +a.date.split('-').join('')
            const dateB = +b.date.split('-').join('')
            return dateB - dateA
        })
        setTransactions(temp)
    }, [props.transactions])
    
    return (
        <LayoutsMainContent>
            <ContentHeader name="Journal Entries"/>
            {/* Entry Content */}
            <div className="mb-4">
                <Link to="new-transaction" className="btn btn-secondary btn-sm">New Transaction</Link>
            </div>
            <div className="card pb-4">
                <div className="card-body">
                    <div className="table-responsive-sm">
                        <table className="table table-striped table-sm table-transaction">
                            <thead>
                                <tr>
                                    <th scope="col" className="tabel-date" >Date</th>
                                    <th scope="col">Contact</th>
                                    <th scope="col">Description</th>
                                    <th scope="col" className="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody className="table-group-divider">
                                {
                                    transactions.map(transaction => {
                                        let contactName = ''
                                        contacts.find(contact => transaction.contactId === contact.id ? contactName = contact.name : null)
                                        
                                        let tempDesc = [], total = 0
                                        transaction.transAccounts.forEach(trans => { 
                                            total += trans.debit
                                            accounts.find(acc => acc.id === trans.account && tempDesc.push(acc.accountName))
                                        })
                                        transaction.memo && tempDesc.push(transaction.memo)
                                        let description = tempDesc.join(', ')

                                        return (
                                            <tr key={transaction.id}>
                                                <td className="ps-2">{transaction.date.split('-').reverse().join('/')}</td>
                                                <td>
                                                    <Link to={`/contacts/detail/${transaction.contactId}`} className="contact-name-transaction">{contactName}</Link>
                                                </td>
                                                <td className="pb-2">
                                                    <p className="mb-0 fw-normal">
                                                        <Link to={`transaction-detail/${transaction.id}`} className="number-transaction">
                                                            {transaction.transType} #{transaction.transNumber}
                                                        </Link>
                                                    </p>
                                                    <p className="mb-0 fw-light description">{description}</p>
                                                </td>
                                                <td className="text-end pe-2">{getCurrency(total)}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    transactions: state.transactions,
    contacts: state.contacts,
    accounts: state.accounts
})
const reduxDispatch = (dispatch) => ({
    getEntriesFromAPI: () => dispatch(getEntriesFromAPI()),
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI())
})

export default connect(reduxState, reduxDispatch)(JournalEntries)