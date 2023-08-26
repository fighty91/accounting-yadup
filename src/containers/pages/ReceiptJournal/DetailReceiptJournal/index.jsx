import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./DetailReceiptJournal.scss"
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { ButtonDelete, ButtonDuplicate, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { deleteReceiptJournalFromAPI, getAccountsFromAPI, getContactFromAPI, getReceiptJournalFromAPI, getUsersFromAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";

const DetailReceiptJournal = (props) => {
    const { transId } = useParams()
    const { getCurrency } = useGeneralFunc()
    const navigate = useNavigate()

    const [accounts, setAccounts] = useState([])
    const [contact, setContact] = useState({name: ''})
    const [transAccounts, setTransAccounts] = useState([])
    const [receiptAccount, setReceiptAccount] = useState({})
    const [transaction, setTransaction] = useState({
        transNumber: "",
        date: '',
        memo: "",
        transType: "Receipt Journal",
        transAccounts: []
    })

    const getContact = async (contactId) => {
        let newContact ={name: ''}
        if(props.contacts.length > 0) {
            props.contacts.forEach(e => {
                e.id === contactId && (newContact = e)
            })
        } else {
            newContact = await props.getContactFromAPI(contactId)
        }
        setContact(newContact)
    }

    const getAccount = (dataId) => {
        let newAccount = {}
        accounts.forEach(acc =>
            acc.id === dataId && (newAccount = acc)
        )
        if(newAccount) return newAccount 
    }

    const handleDeleteTransaction = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `${transaction.transType} #${transaction.transNumber} will be removed from transactions list!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTransaction()
            }
        })
    }
    
    const deleteTransaction = async() => {
        const deleteSuccess = await props.deleteReceiptJournalFromAPI(transaction.id)
        if (deleteSuccess) {
            Swal.fire({
                title: 'Success Delete!',
                text: `${transaction.transType} #${transaction.transNumber} has been deleted`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
            navigate('/receipt-journal')
        }
    }

    const getAuthor = () => {
        const authors = transaction.authors
        if(authors) {
            let initialMsg, authorId, dateTemp
            
            if(authors.length > 1) {
                initialMsg = 'Updated by'
                authorId = authors[authors.length - 1].updatedBy
                dateTemp = new Date(authors[authors.length - 1].updatedAt)
            } else {
                initialMsg = 'Created by'
                authorId = authors[0].createdBy
                dateTemp = new Date(authors[0].createdAt)
            }
            
            let authorName = ''
            for(let e of props.users) {
                if(e.uid2 === authorId) authorName = e.name
            }
            
            let dateMsg = dateTemp.toLocaleString()
            const msg = `${initialMsg} ${authorName} ${dateMsg}`
            return msg
        }
    }

    useEffect(() => {
        getReceiptJournal()
        props.getAccountsFromAPI()
        props.getUsersFromAPI()
    }, [])

    useEffect(() => {
        setAccounts(props.accounts)
    }, [props.accounts])
    
    const getReceiptJournal = async () => {
        let tempTrans
        const propsJournals = props.transactions.receiptJournal
        propsJournals ?
        propsJournals.forEach(trans => trans.id === transId && (tempTrans = trans)) :
        tempTrans = await props.getReceiptJournalFromAPI(transId)

        let tempReceiptAccount, tempTransAccounts = []
        for(let e of tempTrans.transAccounts) {
            e.debit ? tempReceiptAccount = e : tempTransAccounts.push(e)
        }
                
        setTransaction(tempTrans)
        setTransAccounts(tempTransAccounts)
        setReceiptAccount(tempReceiptAccount)
        getContact(tempTrans.contactId)
    }

    return (
        <LayoutsMainContent>
            <ContentHeader name={transaction.transNumber ? `${transaction.transType} #${transaction.transNumber}` : 'Loading...'}/>
            {/* Entry Content */}
            <div className="card pb-5 detail-receipt-journal">
                <div className="card-body">
                    <section>
                        <div className="row">
                            <div className="d-sm-flex justify-content-between">
                                <div>
                                    <div className="d-flex mb-2">
                                        <div className="label">Receive on</div>
                                        <div>: &nbsp;</div>
                                        <Link className="receiptAccount" to={`/accounts/account-detail/${receiptAccount.account}?page=transactions`}>
                                            {getAccount(receiptAccount.account).accountName}
                                        </Link>
                                    </div>
                                    {/* <hr className="mt-0 mb-2 d-none d-sm-block"/> */}
                                    <div className="d-flex mb-2">
                                        <div className="label">Date</div>
                                        <div>: &nbsp;</div>
                                        <div className="date">{transaction.date && transaction.date.split('-').reverse().join('/')}</div>
                                    </div>
                                    <div className="d-flex mb-2">
                                        <div className="label">Contact</div>
                                        <div>: &nbsp;</div>
                                        <Link className="contact" to={`/contacts/detail/${contact.id}`}>
                                            {contact.name}
                                            {/* {getContact(transaction.contactId)} */}
                                        </Link>
                                    </div>
                                </div>
                                <div className="d-none d-sm-block">
                                    <div className="d-flex mb-2">
                                        {
                                            transAccounts ?
                                            <Fragment>
                                                <div className="amount text-secondary">Amount &nbsp;</div>
                                                <div className="amount-value text-primary">
                                                    {
                                                        getCurrency(receiptAccount.debit)
                                                        // getCurrency(transAccounts.reduce((accumulator, val) => accumulator + val.credit, 0))
                                                    }
                                                </div>
                                            </Fragment>
                                            :
                                            <div className="amount text-secondary">Calculating...</div>
                                        }
                                    </div>
                                </div>
                                {
                                    transaction.memo && 
                                    <div className="d-sm-none d-block">
                                        <div className="d-flex mb-2">
                                            <div className="label">Memo</div>
                                            <div>: &nbsp;</div>
                                            <div className="memo">{ transaction.memo }</div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        <hr />
                        <div className="table-responsive-md mb-4 mb-sm-5">
                            <table className="table table-striped table-transaction-receipt-journal">
                                <thead>
                                    <tr>
                                        <th scope="col" className="account" colSpan="2">Account</th>
                                        <th scope="col">Description</th>
                                        <th scope="col" className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {
                                        transAccounts &&
                                        transAccounts.map((trans, i) => {
                                            const account = getAccount(trans.account)
                                            return (
                                                <tr key={i}>
                                                    <td className="account-number">
                                                        <Link to={`/accounts/account-detail/${account.id}?page=transactions`}>
                                                            {account.number} 
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <Link to={`/accounts/account-detail/${account.id}?page=transactions`}>
                                                            {account.accountName}
                                                        </Link>
                                                    </td>
                                                    <td>{trans.description}</td>
                                                    <td className="text-end">{getCurrency(trans.credit)}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section>
                        <div className="row">
                            <div className="d-sm-none d-block mb-4">
                                {
                                    transAccounts ?
                                    <div className="mb-2 amount text-secondary text-end">
                                        Amount <span className="text-primary">
                                            { 
                                                getCurrency(receiptAccount.debit)
                                                // getCurrency(transAccounts && transAccounts.reduce((accumulator, val) => accumulator + val.credit, 0)) 
                                            }
                                        </span>
                                    </div>
                                    :
                                    <div className="mb-2 amount text-secondary text-end">Calculating...</div>
                                }
                            </div>
                        </div>
                        {
                            transaction.memo && 
                            <div className="row d-none d-sm-block">
                                <div className="d-flex mb-5 fst-italic">
                                    <div className="label-memo">Memo</div>
                                    <div>: &nbsp;</div>
                                    <div className="memo">{transaction.memo}</div>
                                </div>
                            </div>
                        }
                        <div className="row">
                            <div className="d-flex justify-content-end justify-content-sm-start mb-4">
                                <div className="createdBy text-end text-sm-start">
                                    {getAuthor()}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <ButtonLinkTo name="Edit" linkTo={`/receipt-journal/edit-transaction/${transaction.id}`} color="outline-primary"/>
                                    &nbsp;&nbsp;&nbsp;
                                    <ButtonDelete color="outline-danger" handleOnClick={handleDeleteTransaction}/>
                                </div>
                                <ButtonDuplicate name="Duplicate Transaction" linkTo={`/receipt-journal/new-transaction?duplicate=true&transId=${transaction.id}`} color='outline-success' />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    users: state.users,
    accounts: state.accounts,
    contacts: state.contacts,
    transactions: state.transactions,
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getContactFromAPI: (data) => dispatch(getContactFromAPI(data)),
    getReceiptJournalFromAPI: (data) => dispatch(getReceiptJournalFromAPI(data)),
    getUsersFromAPI: () => dispatch(getUsersFromAPI()),
    deleteReceiptJournalFromAPI: (data) => dispatch(deleteReceiptJournalFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(DetailReceiptJournal)