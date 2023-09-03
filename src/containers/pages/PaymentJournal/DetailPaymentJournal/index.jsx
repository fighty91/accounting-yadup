import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./DetailPaymentJournal.scss"
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { ButtonDelete, ButtonDuplicate, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { deletePaymentJournalFromAPI, getAccountsFromAPI, getContactFromAPI, getPaymentJournalFromAPI, getUsersFromAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import Swal from "sweetalert2";

const DetailPaymentJournal = (props) => {
    const { transId } = useParams()
    const { getCurrency } = useGeneralFunc()
    const navigate = useNavigate()

    const [accounts, setAccounts] = useState([])
    const [contact, setContact] = useState({ name: ''})
    const [transAccounts, setTransAccounts] = useState([])
    const [paymentAccount, setPaymentAccount] = useState({})
    const [transaction, setTransaction] = useState({
        transNumber: "",
        date: '',
        memo: "",
        transType: "Payment Journal",
        transAccounts: []
    })

    const handleDeleteTransaction = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `${transaction.transType} #${transaction.transNumber} will be removed from transactions list!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) =>
            result.isConfirmed && deleteTransaction()
        )
    }
    
    const deleteTransaction = async() => {
        const deleteSuccess = await props.deletePaymentJournalFromAPI(transaction.id)
        if (deleteSuccess) {
            Swal.fire({
                title: 'Success Delete!',
                text: `${transaction.transType} #${transaction.transNumber} has been deleted`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
            navigate('/payment-journal')
        }
    }

    const getContact = async (contactId) => {
        let temp
        if(props.contacts.length > 0) {
            props.contacts.find(e => e.id === contactId && (temp = e))
        } else {
            temp = await props.getContactFromAPI(contactId)
        }
        temp && setContact(temp)
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
        props.users.length < 1 && props.getUsersFromAPI()
    }, [props.users])

    const getAccount = (dataId) => {
        let newAccount = {name: ''}
        accounts.forEach(acc => acc.id === dataId && (newAccount = acc))
        return newAccount 
    }

    useEffect(() => {
        const temp = props.accounts
        temp.length > 0 ?
        setAccounts(temp) : props.getAccountsFromAPI()
    }, [props.accounts])
    
    const getTransactions = async() => {
        const temps = props.transactions.paymentJournal,
        temp = temps && await temps.find(e => e.id === transId),
        tempTrans = temp ? temp :  await props.getPaymentJournalFromAPI(transId)

        let tempPaymentAccount,
        tempTransAccounts = []

        if(tempTrans) {
            tempTrans.transAccounts.forEach(e => e.credit ? tempPaymentAccount = e : tempTransAccounts.push(e))
            setTransaction(tempTrans)
            setTransAccounts(tempTransAccounts)
            setPaymentAccount(tempPaymentAccount)
            getContact(tempTrans.contactId)
        } else {
            Swal.fire({
                title: 'No Available!',
                text: 'You are trying to access unavailable data',
                icon: 'warning',
                confirmButtonColor: '#fd7e14'
            })
            navigate('/payment-journal')
        }
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])
    return (
        <LayoutsMainContent>
            <ContentHeader name={transaction.transNumber ? `${transaction.transType} #${transaction.transNumber}` : 'Loading...'}/>
            {/* Entry Content */}
            <div className="card pb-5 detail-payment-journal">
                <div className="card-body">
                    <section>
                        <div className="row">
                            <div className="d-sm-flex justify-content-between">
                                <div>
                                    <div className="d-flex mb-2">
                                        <div className="label">Pay from</div>
                                        <div>: &nbsp;</div>
                                        <Link className="paymentAccount" to={`/accounts/account-detail/${paymentAccount.account}?page=transactions`}>
                                            {getAccount(paymentAccount.account).accountName}
                                        </Link>
                                    </div>
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
                                                    { getCurrency(paymentAccount.credit) }
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
                            <table className="table table-striped table-transaction-payment-journal">
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
                                                    <td className="text-end">{getCurrency(trans.debit)}</td>
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
                                            { getCurrency(paymentAccount.credit) }
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
                                    <ButtonLinkTo name="Edit" linkTo={`/payment-journal/edit-transaction/${transaction.id}`} color="outline-primary"/>
                                    &nbsp;&nbsp;&nbsp;
                                    <ButtonDelete color="outline-danger" handleOnClick={handleDeleteTransaction}/>
                                </div>
                                <ButtonDuplicate name="Duplicate Transaction" linkTo={`/payment-journal/new-transaction?duplicate=true&transId=${transaction.id}`} color='outline-success' />
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
    getPaymentJournalFromAPI: (data) => dispatch(getPaymentJournalFromAPI(data)),
    getUsersFromAPI: () => dispatch(getUsersFromAPI()),
    deletePaymentJournalFromAPI: (data) => dispatch(deletePaymentJournalFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(DetailPaymentJournal)