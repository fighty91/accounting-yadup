import React, { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import ContactCard from "../../../components/molecules/ContactCard";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getContactsFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";
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

    const getTransactions = async () => {
        let newTransactions = []
        for(let x in props.transactions) {
            props.transactions[x].forEach(e => newTransactions.push(e))
        }
        const temp = newTransactions.filter(e => e.contactId === contactId)
        setTransactions(temp)
    }
    
    useEffect(() => {
        props.getContactsFromAPI()
        props.getTransactionsFromAPI()
    },[])
    
    useEffect(() => {
        getContact()
    },[props.contacts])

    useEffect(() => {
        getTransactions()
    },[props.transactions])
    
    const getPosition = () => {
        let newPositions = []
        for (let x in positions) {
            if (positions[x] === true) {
                let posName = x.charAt(0).toUpperCase() + x.slice(1);
                let color = ''
                if (x === 'vendor') {color = 'danger'}
                if (x === 'customer') {color = 'success'}
                if (x === 'employee') {color = 'primary'}
                if (x === 'other') {color = 'secondary'}
                newPositions.push({name: posName, color: color})
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
                    <table className="table table-striped table-sm table-transaction">
                        <thead>
                            <tr>
                                <th scope="col" className="tabel-date">Date</th>
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
                                                    <Link to={`/journal-entries/transaction-detail/${trans.id}`} className="number-transaction">
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
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI())
})

export default connect(reduxState, reduxDispatch)(TransactionsContact)