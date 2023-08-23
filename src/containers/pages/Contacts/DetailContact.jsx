import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import ContactCard from "../../../components/molecules/ContactCard";
import { ButtonDelete, ButtonLinkTo } from "../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { deleteContactFromAPI, getAccountsFromAPI, getContactsFromAPI, getTransactionsFromAPI } from "../../../config/redux/action";
import Swal from "sweetalert2";

const DetailContact = (props) => {
    const { contactId } = useParams();
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
    
    const getContact = async () => {
        const newContact = await props.contacts.find(e => e.id === contactId)
        if(newContact) {
            setContact(newContact)
            setPositions(newContact.position)
            setAccountMapping(newContact.defaultAccount)
        }
    }
        
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
        } else {
            deleteContact()
        }
    }
    
    const deleteContact = async () => {
        const res = await props.deleteContactFromAPI(contact.id)
        if(res) {
            navigate('/contacts')
            Toast.fire({
                icon: 'success',
                title: `Success Delete \n${contact.name}`
            })
        }
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
            if (result.isConfirmed) {
                getConfirmDelete()
            }
        })
    }

    useEffect(() => {
        props.getContactsFromAPI()
        props.getAccountsFromAPI()
        props.getTransactionsFromAPI()
    },[])

    useEffect(() => {
        setAccounts(props.accounts)
    }, [props.accounts])

    useEffect(() => {
        getContact()
    }, [props.contacts])

    useEffect(() => {
        let temp = []
        for(let x in props.transactions) {
            props.transactions[x].forEach(e => temp.push(e))
        }
        setTransactions(temp)
    }, [props.transactions])
    
    const {name, address, phone, id } = contact
    const newPositions = getPosition()
    let {expensePayable, accountPayable, accountReceivable } = accountMapping
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
                                    { accReceivable ? <p>{accReceivable.number} &nbsp; {accReceivable.accountName}</p> : <p>-</p> }
                                </td>
                            </tr>
                            <tr>
                                <td><p>Account Payable&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    { accPayable ? <p>{accPayable.number} &nbsp; {accPayable.accountName}</p> : <p>-</p> }
                                </td>
                            </tr>
                            <tr>
                                <td><p>Expense Payable&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    { expPayable ? <p>{expPayable.number} &nbsp; {expPayable.accountName}</p> : <p>-</p> }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <ButtonLinkTo color="outline-primary" name="Edit" linkTo={`/contacts/edit-contact/${id}`} />
                    &nbsp;&nbsp;&nbsp;
                    <ButtonDelete color="outline-danger" handleOnClick={() => handleDeleteContact({id, name})}/>
                    {/* <ButtonDelete color="outline-danger" handleOnClick={handleDeleteTrans}/> */}
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
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getContactsFromAPI: () => dispatch(getContactsFromAPI()),
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI()),
    deleteContactFromAPI: (data) => dispatch(deleteContactFromAPI(data)),
})

export default connect(reduxState, reduxDispatch)(DetailContact)