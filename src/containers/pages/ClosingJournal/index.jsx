import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getAccountsFromAPI, getAllNumberListFromAPI, getClosingJournalsFromAPI } from "../../../config/redux/action";
import { getCurrency } from "../../organisms/MyFunctions/useGeneralFunc";
import './ClosingJournal.scss'

const ClosingJournal = (props) => {
    const [accounts, setAccounts] = useState()
    const [transactions, setTransactions] = useState([])
    const [transNumber, setTransNumber] = useState({})

    const getTransNumber = (id, tNParams) => {
        const temp = transNumber[tNParams]
        if(temp) {
            let newNumberCode
            temp.find(e => {
                if(e.id === id)
                tNParams === 'defaultCode' ?
                newNumberCode = e.transNumber : newNumberCode = `${tNParams}.${e.transNumber}`
            })
            return newNumberCode
        }
    }

    useEffect(() => {
        props.accounts.length === 0 && props.getAccountsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.accounts
        temp.length > 0 && setAccounts(temp)
    }, [props.accounts])

    useEffect(() => {
        !props.transactions.closingJournal && props.getClosingJournalsFromAPI()
    }, [])
    useEffect(() => {
        const temp = props.transactions.closingJournal
        temp && setTransactions(temp)
    }, [props.transactions])

    useEffect(() => {
        const temp = props.nLClosingJournal
        let countTemp = 0
        for(let x in temp) { x && countTemp++ }
        countTemp < 1 && props.getAllNumberListFromAPI('closingJournal')
    }, [])
    useEffect(() => {
        const temp = props.nLClosingJournal
        let countTemp = 0
        for(let x in temp) { x && countTemp++ }
        countTemp > 0 && setTransNumber(temp)
    }, [props.nLClosingJournal])
    
    return (
        <LayoutsMainContent>
            <ContentHeader name="Closing Journal"/>
            {/* Entry Content */}
            <div className="mb-4">
                <Link to="new-transaction" className="btn btn-secondary btn-sm">New Transaction</Link>
            </div>
            <div className="card pb-4">
                <div className="card-body">
                    {
                        transactions.length > 0 ?
                        <div className="table-responsive-sm">
                            <table className="table table-striped table-sm table-transaction-closing-journal">
                                <thead>
                                    <tr>
                                        <th scope="col" className="tabel-date" >Date</th>
                                        <th scope="col">Description</th>
                                        <th scope="col" className="text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {
                                        transactions.map(transaction => {
                                            let tempDesc = [], total = 0
                                            transaction.transAccounts.forEach(trans => { 
                                                total += trans.debit
                                                accounts && accounts.find(acc => acc.id === trans.account && tempDesc.push(acc.accountName))
                                            })
                                            transaction.memo && tempDesc.push(transaction.memo)
                                            let description = tempDesc.join(', ')

                                            return (
                                                <tr key={transaction.id}>
                                                    <td className="ps-2">{transaction.date.split('-').reverse().join('/')}</td>
                                                    <td className="pb-2">
                                                        <p className="mb-0 fw-normal">
                                                            <Link to={`transaction-detail/${transaction.id}`} className="number-transaction">
                                                                {transaction.transType} #{getTransNumber(transaction.tNId, transaction.tNParams)}
                                                            </Link>
                                                        </p>
                                                        <p className="mb-0 fw-light description">{description}</p>
                                                    </td>
                                                    <td className="text-end pe-2">{getCurrency(total)}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                        :
                        <p>There are no transactions...</p>
                    }
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    transactions: state.transactions,
    accounts: state.accounts,
    nLClosingJournal: state.nLClosingJournal
})
const reduxDispatch = (dispatch) => ({
    getClosingJournalsFromAPI: () => dispatch(getClosingJournalsFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getAllNumberListFromAPI: (data) => dispatch(getAllNumberListFromAPI(data))
})

export default connect(reduxState, reduxDispatch)(ClosingJournal)