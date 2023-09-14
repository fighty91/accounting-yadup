import React, { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import ContactCard from "../../../components/molecules/ContactCard";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";
import './Contacts.scss'

const TransactionsContact = (props) => {
    let { contactId } = useParams();
    const { getCurrency } = useGeneralFunc()
    const [contact, setContact] = useState({})
    const [positions, setPositions] = useState({})
    const [transactions, setTransactions] = useState([])

    const getContact = () => {
        const newContact = props.contacts.find(e => e.id === contactId)
        if(newContact) {
            setContact(newContact)
            setPositions(newContact.position)
        }
    }

    useEffect(() => {
        props.getContactsFromAPI()
        // props.getTransactionsFromAPI()
    },[])
    
    useEffect(() => {
        getContact()
    },[props.contacts])

    // useEffect(() => {
    //     let newTransactions = []
    //     for(let x in props.transactions) {
    //         for(let e of props.transactions[x]) {
    //             e.contactId === contactId && newTransactions.push(e)
    //         }
    //         // props.transactions[x].forEach(e => 
    //         //     e.contactId === contactId && newTransactions.push(e)
    //         // )
    //     }
    //     newTransactions.sort((a, b) => 
    //         a.transNumber < b.transNumber ? 1 :
    //         a.transNumber > b.transNumber ? -1 : 0
    //     )
    //     newTransactions.sort((a, b) => 
    //         a.date < b.date ? 1 :
    //         a.date > b.date ? -1 : 0
    //     )
    //     setTransactions(newTransactions)
    // },[props.transactions])

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
        temp2 = props.transactions.receiptJournal,
        temp3 = props.transactions.paymentJournal,
        temp4 = props.transactions.journalEntries,
        temp1url = '/opening-balance',
        temp2url = '/receipt-journal/transaction-detail/',
        temp3url = '/payment-journal/transaction-detail/',
        temp4url = '/journal-entries/transaction-detail/'

        temp2 && temp2.forEach(acc => acc.contactId === contactId && trans.push({...acc, surl: temp2url + acc.id}))
        temp3 && temp3.forEach(acc => acc.contactId === contactId && trans.push({...acc, surl: temp3url + acc.id}))
        temp4 && temp4.forEach(acc => acc.contactId === contactId && trans.push({...acc, surl: temp4url + acc.id}))
        // trans.sort((a, b) => a.transNumber < b.transNumber ? -1 : a.transNumber > b.transNumber ? 1 : 0)
        trans.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

        temp1 && temp1.forEach(acc => acc.contactId === contactId && trans.unshift({...acc, surl: temp1url}))
        trans.length > 0 && setTransactions(trans)
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])
    
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
    
    const {name, id } = contact
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
                                        <th scope="col" className="tabel-date" onClick={()=> console.log(transactions)}>Date</th>
                                        <th scope="col">Description</th>
                                        <th scope="col" className="text-end">Total</th>
                                        {/* <th scope="col" className="text-end">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {
                                        transactions.map(trans => {
                                            const {date, transType, transNumber, memo, transAccounts} = trans
                                            let amount = 0
                                            transAccounts.forEach(e => amount += e.debit)
                                            return (
                                                <tr key={trans.id}>
                                                    <td>{date.split('-').reverse().join('/')}</td>
                                                    <td className="pb-2">
                                                        <p className="mb-0 fw-normal">
                                                            {/* <Link to={`/journal-entries/transaction-detail/${trans.id}`} className="number-transaction"> */}
                                                            <Link to={trans.surl} className="number-transaction">
                                                                {transType} #{transNumber}
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
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(TransactionsContact)