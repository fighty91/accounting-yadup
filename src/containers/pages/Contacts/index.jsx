import React, { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import './Contacts.scss'
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { deleteContactFromAPI, getContactsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../config/redux/action";
import Swal from "sweetalert2";

const Contacts = (props) => {
    const [contacts, setContacts] = useState([])
    const [transactions, setTransactions] = useState([])

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

    const lostConnection = () => Swal.fire({
        title: 'Offline!',
        text: 'Sorry, your internet connection is lost!!',
        icon: 'warning',
        confirmButtonColor: '#fd7e14'
    })
    const deleteContact = async (data) => {
        const res = await props.deleteContactFromAPI(data.id)
        if(res) {
            Toast.fire({
                icon: 'success',
                title: `Success Delete \n${data.name}`,
            })
        }
    }
    const getConfirmDelete = (data) => {
        const res = transactions.find(e => e.contactId === data.id)
        if(res) {
            Swal.fire({
                title: 'Failed!',
                text: `There is already transactions in ${data.name}`,
                icon: 'error',
                confirmButtonText: 'Close',
                confirmButtonColor: '#dc3545'
            })
        } else deleteContact(data)
    }
    const handleDeleteContact = (data) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `${data.name} will be removed from the list!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if(result.isConfirmed) {
                window.navigator.onLine ?
                getConfirmDelete(data) : lostConnection()
            }
        })
    }

    useEffect(() => {
        props.contacts.length < 1 && props.getContactsFromAPI()
    }, [])
    useEffect(() => {
        props.contacts.length > 0 && setContacts(props.contacts)
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

    return (
        <Fragment>
            <LayoutsMainContent>
                <ContentHeader name="Contacts"/>
                {/* Entry Content */}
                <div className="mb-4">
                    <Link to="/contacts/new-contact" className="btn btn-secondary btn-sm">New Contact</Link>
                </div>
                <div className="card pb-4">
                    <div className="card-body">
                        <div className="table-responsive-sm">
                            <table className="table table-striped table-sm table-contacts">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Phone</th>
                                        <th scope="col" className="text-start">Position</th>
                                        <th scope="col" className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {
                                        contacts.map((contact, i) => {
                                            const {id, name, address, phone, position} = contact
                                            const {customer, vendor, employee, other} = position
                                            let positions = []
                                            if (customer) {positions.push('Customer')}
                                            if (vendor) {positions.push('Vendor')}
                                            if (employee) {positions.push('Employee')}
                                            if (other) {positions.push('Other')}

                                            return (
                                                <tr key={id}>
                                                    <td>{i+1}</td>
                                                    <td className="ps-2">
                                                        <Link to={`/contacts/detail/${id}`} className="contact-name">
                                                            <p className="mb-0 fw-normal">{name}</p>
                                                        </Link>
                                                        <p className="mb-0 fw-light address">{address ? address : "-"}</p>
                                                    </td>
                                                    <td>{phone}</td>
                                                    <td className="text-start position">{positions.join(', ')}</td>
                                                    <td className="text-end">
                                                        <div className="btn-group" role="group" aria-label="Basic outlined example">
                                                            <button type="submit" className="btn btn-outline-danger action" onClick={()=>handleDeleteContact({id, name})}>Delete</button>
                                                            <Link to={`/contacts/edit-contact/${id}`} className="btn btn-outline-success action">Edit</Link>
                                                            <Link to={`/contacts/detail/${id}`} className="btn btn-outline-primary action">View</Link>
                                                        </div>
                                                    </td>
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
        </Fragment>
    )
}

const reduxState = (state) => ({
    contacts: state.contacts,
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    deleteContactFromAPI: (data) => dispatch(deleteContactFromAPI(data)),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(Contacts)