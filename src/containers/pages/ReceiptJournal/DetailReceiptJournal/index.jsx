import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { ButtonDelete, ButtonDuplicate, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { deleteNumberListFromAPI, deleteReceiptJournalFromAPI, getAccountsFromAPI, getContactFromAPI, getReceiptJournalFromAPI, getTransNumberFromAPI, getUsersFromAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";
import Swal from "sweetalert2";
// import { useGeneralFunc } from "../../../../utils/MyFunction/MyFunction";
import { getCurrency } from "../../../organisms/MyFunctions/useGeneralFunc";
import "./DetailReceiptJournal.scss"

const DetailReceiptJournal = (props) => {
    const { transId } = useParams()
    const navigate = useNavigate()

    const [accounts, setAccounts] = useState([])
    const [contact, setContact] = useState({name: ''})
    const [transAccounts, setTransAccounts] = useState([])
    const [receiptAccount, setReceiptAccount] = useState({})
    const [transaction, setTransaction] = useState({
        tNId: "",
        tNParams: '',
        date: '',
        memo: "",
        transType: "Receipt Journal",
        transAccounts: []
    })
    const [transNumber, setTransNumber] = useState()
    const [dataReady, setDataReady] = useState(false)
    
    const deleteTransaction = async() => {
        const {tNId, tNParams} = transaction
        const deleteSuccess = await props.deleteReceiptJournalFromAPI(transaction.id)
        if (deleteSuccess) {
            navigate('/receipt-journal')
            await props.deleteNumberListFromAPI({tNId, tNParams, codeFor: 'receiptJournal'})
            Swal.fire({
                title: 'Success Delete!',
                text: `${transaction.transType} #${transNumber} has been deleted`,
                icon: 'success',
                confirmButtonColor: '#198754'
            })
        }
    }
    const handleDeleteTransaction = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `${transaction.transType} #${transNumber} will be removed from transactions list!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            result.isConfirmed && deleteTransaction()
        })
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
                e.uid2 === authorId && (authorName = e.name)
            }
            
            let dateMsg = dateTemp.toLocaleString()
            const msg = `${initialMsg} ${authorName} ${dateMsg}`
            return msg
        }
    }

    const getAccount = (dataId) => {
        let newAccount = {name: ''}
        accounts.forEach(acc => acc.id === dataId && (newAccount = acc))
        return newAccount 
    }
    
    useEffect(() => {
        props.users.length < 1 && props.getUsersFromAPI()
    }, [])
    
    useEffect(() => {
        props.accounts.length === 0 && props.getAccountsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.accounts
        temp.length > 0 && setAccounts(temp)
    }, [props.accounts])
    
    const getTransactions = async() => {
        const temps = props.transactions.receiptJournal,
        temp = temps && await temps.find(e => e.id === transId),
        tempTrans = temp ? temp : await props.getReceiptJournalFromAPI(transId)

        let tempReceiptAccount,
        tempTransAccounts = []

        if(tempTrans) {
            tempTrans.transAccounts.forEach(e => e.debit ? tempReceiptAccount = e : tempTransAccounts.push(e))
            setTransaction(tempTrans)
            setTransAccounts(tempTransAccounts)
            setReceiptAccount(tempReceiptAccount)
            getContact(tempTrans.contactId)
            setDataReady(true)

            const {tNId, tNParams} = tempTrans
            let newTransNumb = await props.getTransNumberFromAPI({tNId, tNParams, codeFor: 'receiptJournal'})
            setTransNumber(newTransNumb)
        }
        else if(!dataReady) {
            navigate('/receipt-journal')
            Swal.fire({
                title: 'No Available!',
                text: 'You are trying to access unavailable data',
                icon: 'warning',
                confirmButtonColor: '#fd7e14'
            })
        }
    }
    useEffect(() => {
        getTransactions()
    }, [props.transactions])

    return (
        <LayoutsMainContent>
            <ContentHeader name={transNumber ? `${transaction.transType} #${transNumber}` : 'Loading...'}/>
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
                                                    { getCurrency(receiptAccount.debit) }
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
                                            { getCurrency(receiptAccount.debit) }
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
    transactions: state.transactions
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getContactFromAPI: (data) => dispatch(getContactFromAPI(data)),
    getReceiptJournalFromAPI: (data) => dispatch(getReceiptJournalFromAPI(data)),
    getUsersFromAPI: () => dispatch(getUsersFromAPI()),
    deleteReceiptJournalFromAPI: (data) => dispatch(deleteReceiptJournalFromAPI(data)),
    getTransNumberFromAPI: (data) => dispatch(getTransNumberFromAPI(data)),
    deleteNumberListFromAPI: (data) => dispatch(deleteNumberListFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(DetailReceiptJournal)