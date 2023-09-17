import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { ButtonSubmit, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import ContactPositionForm from "../../../../components/molecules/ContactPositionForm";
import './EditContact.scss'
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getAccountsFromAPI, getContactFromAPI, putContactToAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import Swal from "sweetalert2";

const EditContact = (props) => {
    const [contact, setContact] = useState({name: '', phone: '', address: '', isActive: true})
    const [positions, setPositions] = useState({vendor: false, customer: false, employee: false, other: false})
    const [accountReceivables, setAccountReceivables] = useState([])
    const [accountPayables, setAccountPayables] = useState([])
    const [accountMapping, setAccountMapping] = useState({})
    const [submitLoading, setSubmitLoading] = useState(false)

    const navigate = useNavigate()
    const {contactId} = useParams()

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
    
    const handleEntryContact = (data) => {
        let newContact = {...contact}
        newContact[data.target.name] = data.target.value
        setContact(newContact)
    }
    
    const handlePosition = (data) => {
        let newPositions = {...positions}
        newPositions[data.target.name] = data.target.checked
        setPositions(newPositions)
    }
    
    const handleAccountMapping = (data) => {
        let newMapping = {...accountMapping}
        newMapping[data.target.name] = data.target.value
        setAccountMapping(newMapping)
    }
    
    const lostConnection = () => Swal.fire({
        title: 'Offline!',
        text: 'Sorry, your internet connection is lost!!',
        icon: 'warning',
        confirmButtonColor: '#fd7e14'
    })
    const putDataToAPI = async (data) => {
        const res = await props.putContactToAPI(data)
        if(res) {
            Toast.fire({
                icon: 'success',
                title: `Success Update \n${data.name}`
            })
            navigate(`/contacts/detail/${data.id}`)
        }
        setSubmitLoading(false)
    }
    const handleSubmit = () => {
        !window.navigator.onLine && lostConnection()
        if(!submitLoading && window.navigator.onLine) {
            setSubmitLoading(true)
            let problemCount = 0
            let positionCount = 0
            for(let x in positions) {
                positions[x] === true && positionCount++ 
            }
            if(positionCount < 1) {
                problemCount++
                Swal.fire({
                    title: 'Pending!',
                    text: 'Please mark input position first!!',
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            }
            if(contact.name.length < 3) {
                problemCount++
                Swal.fire({
                    title: 'Pending!',
                    text: 'Name at least 3 characters!!',
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            }
            if(contact.name.charAt(0) === ' ') {
                problemCount++
                Swal.fire({
                    title: 'Pending!',
                    text: "Contact names can't start with a space!!",
                    icon: 'warning',
                    confirmButtonColor: '#fd7e14'
                })
            }

            if(problemCount > 0) setSubmitLoading(false)
            else {
                let newContact = {...contact}
                newContact['defaultAccount'] = accountMapping
                newContact['position'] = positions
                putDataToAPI(newContact)
            }
        }
    }
    
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
    }, [])
    
    const getAccounts = () => {
        const newAccounts = props.accounts.filter(e => !e.isParent)
        const newAccountReceivables = newAccounts.filter(account => account.categoryId === "2")
        const newAccountPayables = newAccounts.filter(account => account.categoryId === "7")
        setAccountReceivables(newAccountReceivables)
        setAccountPayables(newAccountPayables)
    }
    useEffect(() => {
        props.accounts.length < 1 && props.getAccountsFromAPI()
    }, [])
    useEffect(() => {
        props.accounts.length > 0 && getAccounts()
    }, [props.accounts, contact])

    return(
        <LayoutsMainContent>
            <ContentHeader name="Edit Contact"/>
            {/* Entry Content */}
            <div className="card pb-5">
                <div className="card-header">
                    Update contact
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" className="form-control form-control-sm" id="name" name="name" onChange={handleEntryContact} value={contact.name}/>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="phone" className="form-label">Phone</label>
                            <input type="tel" className="form-control form-control-sm" id="phone" name="phone" onChange={handleEntryContact} value={contact.phone}/>
                        </div>
                        <div className="col-12">
                            <label htmlFor="address" className="form-label">Address</label>
                            <input type="text" className="form-control form-control-sm" id="address" name="address" onChange={handleEntryContact} value={contact.address}/>
                        </div>
                    </div>
                    <br />

                    <ContactPositionForm data={positions} handleOnClick={(value)=>handlePosition(value)} className="mb-5"/>

                    <hr className="mb-3"/>
                    <br />
                    <div className="mb-5">
                        <h5 className="mb-1">Account Mapping</h5>
                        <p className="fw-light note-account-mapping">Note: mapping tidak berlaku untuk transaksi yang sudah terjadi</p>
                        <div className="row mb-3">
                            <label htmlFor="accountReceivable" className="col-sm-3 col-form-label">Account Receivable</label>
                            <div className="col-sm-9">
                                <select className="form-select form-select-sm" id="accountReceivable" value={accountMapping.accountReceivable} name="accountReceivable" onChange={handleAccountMapping} >
                                    {
                                        accountReceivables.map((account, i) => {
                                            return (<option key={i} value={account.id}>{account.number}&nbsp;&nbsp;&nbsp;{account.accountName}</option>)
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="accountPayable" className="col-sm-3 col-form-label">Account Payable</label>
                            <div className="col-sm-9">
                                <select className="form-select form-select-sm" id="accountPayable" value={accountMapping.accountPayable} name="accountPayable" onChange={handleAccountMapping}>
                                    {
                                        accountPayables.map((account, i) => {
                                            return (<option key={i} value={account.id}>{account.number}&nbsp;&nbsp;&nbsp;{account.accountName}</option>)
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="expensePayable" className="col-sm-3 col-form-label">Expense Payable</label>
                            <div className="col-sm-9">
                                <select className="form-select form-select-sm" id="expensePayable" value={accountMapping.expensePayable} name="expensePayable" onChange={handleAccountMapping}>
                                    {
                                        accountMapping.expensePayable &&
                                        accountPayables.map((account, i) => {
                                            return (<option key={i} value={account.id}>{account.number}&nbsp;&nbsp;&nbsp;{account.accountName}</option>)
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    {
                        submitLoading ?
                        <ButtonSubmit name={submitLoading && 'Loading...'} color="primary"/>
                        :
                        <ButtonSubmit handleOnClick={handleSubmit} isUpdate={true} color="outline-primary"/>
                    }
                    &nbsp;&nbsp;&nbsp;
                    <ButtonLinkTo name="Cancel" linkTo={`/contacts/detail/${contactId}`} color="outline-danger"/>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    contacts: state.contacts,
    accounts: state.accounts
})
const reduxDispatch = (dispatch) => ({
    getContactFromAPI: (data) =>dispatch(getContactFromAPI(data)),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    putContactToAPI: (data) => dispatch(putContactToAPI(data))
})

export default connect(reduxState, reduxDispatch)(EditContact)