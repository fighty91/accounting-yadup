import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./DetailJournalEntries.scss"
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { ButtonDelete, ButtonDuplicate, ButtonLinkTo } from "../../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { useGeneralFunc, useJournalEntriesFunc } from "../../../../utils/MyFunction/MyFunction";
import { getAccountsFromAPI, getContactsFromAPI, getEntriesFromAPI } from "../../../../config/redux/action";
import { connect } from "react-redux";

const DetailJournalEntries = (props) => {
    const { transId } = useParams()
    const { getCurrency } = useGeneralFunc()
    const { deleteEntries } = useJournalEntriesFunc()
    const navigate = useNavigate()

    const [accounts, setAccounts] = useState([])
    const [contact, setContact] = useState({ name: ''})
    const [transAccounts, setTransAccounts] = useState([])
    const [transaction, setTransaction] = useState({
        transNumber: "",
        date: '',
        memo: "",
        transType: "Journal Entries",
        transAccounts: []
    })

    const getContact = async (contactId) => {
        let newContact = {}
        props.contacts.forEach(e => {
            if(e.id === contactId) newContact = e
        })
        setContact(newContact)
    }

    const getAccount = (dataId) => {
        let newAccount = {}
        accounts.forEach(acc => {
            if(acc.id === dataId) newAccount = acc
        })
        if(newAccount) {
            return newAccount 
        }
    }

    const handleDeleteTransaction = () => {
        if(window.confirm(`Yakin ingin menghapus transaksi ${transaction.transType} #${transaction.transNumber}??`)) {
            deleteTransaction()
        }
    }
    
    const deleteTransaction = async() => {
        const deleteSuccess = await deleteEntries(transaction.id)
        if (deleteSuccess) {
            navigate('/journal-entries')
            setTimeout(()=> {
                alert(`Berhasil menghapus transaksi #${transaction.transNumber}`)
            }, 700)
        }
    }

    useEffect(() => {
        props.getAccountsFromAPI()
        props.getContactsFromAPI()
        props.getEntriesFromAPI()
    }, [])

    useEffect(() => {
        setAccounts(props.accounts)
    }, [props.accounts])
    
    useEffect(() => {
        let temp = {}
        for(let x in props.transactions) {
            if( x === 'journalEntries' ) {
                props.transactions[x].forEach(e => {
                    if(e.id === transId) temp = e
                })
            }
        }
        setTransaction(temp)
        setTransAccounts(temp.transAccounts)
        getContact(temp.contactId)
    }, [props.transactions])

    return (
        <LayoutsMainContent>
            <ContentHeader name={transaction.transNumber ? `${transaction.transType} #${transaction.transNumber}` : 'Loading...'}/>
            {/* Entry Content */}
            <div className="card pb-5">
                <div className="card-body">
                    <div className="row">
                        <div className="d-sm-flex justify-content-between">
                            <div>
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
                                                {
                                                    getCurrency(transAccounts.reduce((accumulator, val) => accumulator + val.credit, 0))
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
                    <div className="table-responsive-sm mb-4 mb-sm-5">
                        <table className="table table-striped table-transaction">
                            <thead>
                                <tr>
                                    <th scope="col" className="account" colSpan="2">Account</th>
                                    <th scope="col">Description</th>
                                    <th scope="col" className="text-end">Debit</th>
                                    <th scope="col" className="text-end">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="table-group-divider">
                                {
                                    transAccounts &&
                                    transAccounts.map((trans, i) => {
                                        const account = getAccount(String(trans.account))
                                        return (
                                            <tr key={i}>
                                                <td className="account-number">
                                                    <Link to={`/accounts/account-detail/${account.id}?page=transactions`} className="account-detail-journal-entries">
                                                        {account.number} 
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link to={`/accounts/account-detail/${account.id}?page=transactions`} className="account-detail-journal-entries">
                                                        {account.accountName}
                                                    </Link>
                                                </td>
                                                <td>{trans.description}</td>
                                                <td className="text-end">{getCurrency(trans.debit)}</td>
                                                <td className="text-end">{getCurrency(trans.credit)}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="row">
                        <div className="d-sm-none d-block mb-4">
                            {
                                transAccounts ?
                                <div className="mb-2 amount text-secondary text-end">
                                    Amount <span className="text-primary">
                                        { getCurrency(transAccounts && transAccounts.reduce((accumulator, val) => accumulator + val.credit, 0)) }
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
                                <div className="label">Memo</div>
                                <div>: &nbsp;</div>
                                <div className="memo">{transaction.memo}</div>
                            </div>
                        </div>
                    }
                    <div className="row">
                        <div className="d-flex justify-content-between">
                            <div>
                                <ButtonLinkTo name="Edit" linkTo={`/journal-entries/edit-transaction/${transaction.id}`} color="outline-primary"/>
                                &nbsp;&nbsp;&nbsp;
                                <ButtonDelete color="outline-danger" handleOnClick={handleDeleteTransaction}/>
                            </div>
                            <ButtonDuplicate name="Duplicate Transaction" linkTo={`/journal-entries/new-transaction?duplicate=true&transId=${transaction.id}`} color='outline-success' />
                        </div>
                    </div>
                </div>
            </div>
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
    getEntriesFromAPI: () => dispatch(getEntriesFromAPI())
})

export default connect(reduxState, reduxDispatch)(DetailJournalEntries)