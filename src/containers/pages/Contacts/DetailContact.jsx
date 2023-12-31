import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import ContactCard from "../../../components/molecules/ContactCard";
import { ButtonDelete, ButtonLinkTo } from "../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { deleteContactFromAPI, getAccountsFromAPI, getContactFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../config/redux/action";
import Swal from "sweetalert2";

const DetailContact = (props) => {
    const {contactId} = useParams();
    const [contact, setContact] = useState({})
    const [positions, setPositions] = useState({})
    const [accountMapping, setAccountMapping] = useState({})
    const [accounts, setAccounts] = useState([])
    const [transactions, setTransactions] = useState([])

    const navigate = useNavigate()

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1700,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    
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
    
    const lostConnection = () => Swal.fire({
        title: 'Offline!',
        text: 'Sorry, your internet connection is lost!!',
        icon: 'warning',
        confirmButtonColor: '#fd7e14'
    })
    const deleteContact = async() => {
        const res = await props.deleteContactFromAPI(contact.id)
        if(res) {
            navigate('/contacts')
            Toast.fire({
                icon: 'success',
                title: `Success Delete \n${contact.name}`
            })
        }
    }
    const getConfirmDelete = () => {
        const res = transactions.find(e => e.contactId === contact.id)
        if(res) {
            Swal.fire({
                title: 'Failed!',
                text: `There is already transactions in ${contact.name}`,
                icon: 'error',
                confirmButtonText: 'Close',
                confirmButtonColor: '#dc3545'
            })
        } else deleteContact()
    }
    const handleDeleteContact = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `${contact.name} will be removed from the list!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if(result.isConfirmed) {
                window.navigator.onLine ?
                getConfirmDelete() : lostConnection()
            }
        })
    }

    useEffect(() => {
        props.accounts.length < 1 && props.getAccountsFromAPI()
    },[])
    useEffect(() => {
        props.accounts.length > 0 && setAccounts(props.accounts)
    }, [props.accounts])

    const getContact = async() => {
        const temp = props.contacts,
        newContact = temp.length > 0 ? temp.find(e => e.id === contactId) : await props.getContactFromAPI(contactId)
        if(newContact) {
            setContact(newContact)
            setPositions(newContact.position)
            setAccountMapping(newContact.defaultAccount)
        }
    }
    useEffect(() => {
        getContact()
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
    useEffect(() => {
        let temp = []
        for(let x in props.transactions) {
            props.transactions[x].forEach(e => temp.push(e))
        }
        setTransactions(temp)
    }, [props.transactions])
    
    const {name, address, phone, id} = contact
    const newPositions = getPosition()
    let {expensePayable, accountPayable, accountReceivable} = accountMapping
    let expPayable, accPayable, accReceivable

    accounts.forEach(account => {
        const {number, accountName} = account
        if(account.id === accountReceivable) {accReceivable = {number, accountName}}
        if(account.id === accountPayable) {accPayable = {number, accountName}}
        if(account.id === expensePayable) {expPayable = {number, accountName}}
    })

    return(
        <LayoutsMainContent>
            <ContentHeader name="Information"/>
            <ContactCard contactId={id} detailActive="active" newPositions={newPositions} name={name}>
                <div className="card-text mb-4">
                    <table>
                        <tbody>
                            <tr>
                                <td><p>Phone&nbsp;</p></td>
                                <td><p>:&nbsp;&nbsp;&nbsp;</p></td>
                                <td><p>{phone ? phone : '-'}</p></td>
                            </tr>
                            <tr>
                                <td><p>Address&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td><p>{address ? address : '-'}</p></td>
                            </tr>
                            <tr>
                                <td colSpan={3}>&nbsp;</td>
                            </tr>
                            <tr>
                                <td colSpan={3}><h6>Account Mapping</h6></td>
                            </tr>
                            <tr>
                                <td><hr className="mt-0"/></td>
                            </tr>
                            <tr>
                                <td><p>Account Receivable&nbsp;&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    {accReceivable ? <p>{accReceivable.number} &nbsp; {accReceivable.accountName}</p> : <p>-</p>}
                                </td>
                            </tr>
                            <tr>
                                <td><p>Account Payable&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    {accPayable ? <p>{accPayable.number} &nbsp; {accPayable.accountName}</p> : <p>-</p>}
                                </td>
                            </tr>
                            <tr>
                                <td><p>Expense Payable&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    {expPayable ? <p>{expPayable.number} &nbsp; {expPayable.accountName}</p> : <p>-</p>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <ButtonLinkTo color="outline-primary" name="Edit" linkTo={`/contacts/edit-contact/${id}`} />
                    &nbsp;&nbsp;&nbsp;
                    <ButtonDelete color="outline-danger" handleOnClick={() => handleDeleteContact({id, name})}/>
                </div>
            </ContactCard>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    accounts: state.accounts,
    contacts: state.contacts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getContactFromAPI: (data) => dispatch(getContactFromAPI(data)),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    deleteContactFromAPI: (data) => dispatch(deleteContactFromAPI(data)),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(DetailContact)