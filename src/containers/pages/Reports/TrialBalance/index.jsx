import React, { Fragment, useState } from "react";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getCurrencyAbs, getFullDateNow } from "../../../organisms/MyFunctions/useGeneralFunc";
import { connect } from "react-redux";
import { ButtonSubmit } from "../../../../components/atoms/ButtonAndLink";
import { getAccountsFromAPI, getClosingJournalsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../../config/redux/action";
import { Link } from "react-router-dom";
import '../Reports.scss'

const TrialBalance = (props) => {
    const [date, setDate] = useState({})
    const [dateParams, setDateParams] = useState({})
    const [showData, setShowData] = useState(false)
    const [loading, setLoading] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [totalOpening, setTotalOpening] = useState({})
    const [totalMutation, setTotalMutation] = useState({})
    const [totalAmount, setTotalAmount] = useState({})
    
    const getParentAccounts = (childData, parentData) => {
        let newParentAccounts = []
        parentData.forEach(parent => {
            let childAccounts = []
            childData.forEach(acc =>
                acc.parentId === parent.id && childAccounts.push(acc)
            )
            childAccounts.length > 0 && newParentAccounts.push({...parent, childAccounts})
        })
        let newAssets = [], newLiabilities = [], newEquities = [], newIncomes = [], newExpenses = [], newOtherInEx = []
        newParentAccounts.forEach(e => {
            newParentAccounts.push(e)
            e.categoryId < 7 && newAssets.push(e)
            e.categoryId === '7' && newLiabilities.push(e)
            e.categoryId === '8' && newEquities.push(e)
            e.categoryId > 8 && e.categoryId < 11 && newIncomes.push(e)
            e.categoryId > 10 && e.categoryId < 13 && newExpenses.push(e)
            e.categoryId === '13' && newOtherInEx.push(e)
        })
        const newAccounts = [
            {name: 'Assets', parentAccs: newAssets},
            {name: 'Liability', parentAccs: newLiabilities},
            {name: 'Equity', parentAccs: newEquities},
            {name: 'Income', parentAccs: newIncomes},
            {name: 'Expense', parentAccs: newExpenses},
            {name: 'Other Income / Expense', parentAccs: newOtherInEx}
        ]
        setAccounts(newAccounts)

        setTimeout(() => { // nanti buat penghitungan mundur
            setShowData(true)
            setLoading(false)
        }, 500)
    }
    const getChildTransAmount = (newAccounts, openingTrans, newTransactions) => {
        let periodeTrans = newTransactions,
        childData = newAccounts.filter(e => !e.isParent),
        parentData = newAccounts.filter(e => e.isParent)
        let  tempOpening = {debit: 0, credit: 0}, tempMutation = {debit: 0, credit: 0}, tempAmount = {debit: 0, credit: 0}

        childData.forEach(acc => {
            acc.openingAmount = 0; acc.mutation = 0; acc.amount = 0
            const {id} = acc
            openingTrans.forEach(trans => {
                const {account, debit, credit} = trans
                if(account === id) {
                    acc.openingAmount = acc.openingAmount + debit - credit
                    acc.amount = acc.amount + debit - credit
                }
            })
            periodeTrans.forEach(trans => {
                const {account, debit, credit} = trans
                if(account === id) {
                    acc.mutation = acc.mutation + debit - credit
                    acc.amount = acc.amount + debit - credit
                }
            })
            if(acc.openingAmount > 0) {
                tempOpening.debit += acc.openingAmount
                tempAmount.debit += acc.openingAmount
            } else {
                tempOpening.credit += acc.openingAmount
                tempAmount.credit += acc.openingAmount
            }
            if(acc.mutation > 0) {
                tempMutation.debit += acc.mutation
                tempAmount.debit += acc.mutation
            }
            else {
                tempMutation.credit += acc.mutation
                tempAmount.credit += acc.mutation
            }
        })
        let childAccounts = []
        childData.forEach(acc => {
            childAccounts.push(acc)
        })
        setTotalOpening(tempOpening)
        setTotalMutation(tempMutation)
        setTotalAmount(tempAmount)
        getParentAccounts(childAccounts, parentData)
    }
    const getTransactions = async(newAccounts) => {
        let temp = props.transactions, openingTrans = [], periodeTrans = []
        if(!temp.openingBalance) temp.openingBalance = await props.getOpeningBalanceFromAPI()
        if(!temp.receiptJournal) temp.receiptJournal = await props.getReceiptJournalsFromAPI()
        if(!temp.paymentJournal) temp.paymentJournal = await props.getPaymentJournalsFromAPI()
        if(!temp.journalEntries) temp.journalEntries = await props.getJournalEntriesFromAPI()
        if(!temp.closingJournal) temp.closingJournal = await props.getClosingJournalsFromAPI()
        for(let x in temp) {
            // if(x !== 'closingJournal')
            temp[x].forEach(e => {
                if(e.date < date.startDate) e.transAccounts.forEach(acc => openingTrans.push(acc))
                else if(e.date <= date.endDate) e.transAccounts.forEach(acc => periodeTrans.push(acc))
            })
        }
        getChildTransAmount(newAccounts, openingTrans, periodeTrans)
    }
    const handleSubmit = async() => {
        if(date.startDate && date.endDate && date.startDate <= date.endDate) {
            setLoading(true)
            setShowData(false)
            let temp = props.accounts
            if(temp.length < 1) temp = await props.getAccountsFromAPI()
            if(temp.length > 0) getTransactions(temp)
        }
    }
    const handleChangeDate = (e) => {
        const temp = {...date, [e.target.name]: e.target.value}
        setDate(temp)
    }
    const handleParamsTrue = (e) => {
        const temp = {...dateParams, [e.target.name]: true}
        setDateParams(temp)
    }
    const handleParamsFalse = (e) => {
        const tempName = e.target.name
        if(!date[tempName]) {
            const temp = {...dateParams, [tempName]: false}
            setDateParams(temp)
        }
    }
    const handleClickDate = (e) => {
        const tempName = e.target.name
        if(!date[tempName]) {
            const temp = {...date, [tempName]: getFullDateNow()}
            setDate(temp)
        }
    }

    return(
        <LayoutsMainContent>
            <ContentHeader name="Neraca Saldo" periode={true} />
            <div className="row g-3 mb-2">
            <div className="col-sm-auto col-md-4 col-lg-3 col-xl-2">
                    <label htmlFor="date" className="form-label mb-0">
                        <small>Start Date</small>
                    </label>
                    {
                        dateParams.startDate ? 
                        <input type="date" className="form-control form-control-sm" id="startDate" name="startDate" defaultValue={date.startDate || getFullDateNow()} onChange={handleChangeDate} onMouseLeave={handleParamsFalse} onClick={handleClickDate}/>
                        :
                        <input type="text" className="form-control form-control-sm" placeholder="Entry date..." name="startDate" defaultValue='' onMouseEnter={handleParamsTrue}/>
                    }
                </div>
                <div className="col-sm-auto col-md-4 col-lg-3 col-xl-2">
                    <label htmlFor="date" className="form-label mb-0">
                        <small>End Date</small>
                    </label>
                    {
                        dateParams.endDate ?
                        <input type="date" className="form-control form-control-sm" id="endDate" name="endDate" defaultValue={date.endDate || getFullDateNow()} onChange={handleChangeDate} onMouseLeave={handleParamsFalse} onClick={handleClickDate} />
                        :
                        <input type="text" className="form-control form-control-sm" placeholder="Entry date..." name="endDate" defaultValue='' onMouseEnter={handleParamsTrue}/>
                    }
                </div>
                <div className="col-auto d-flex align-items-end">
                    {
                        loading ?
                        <ButtonSubmit name='Loading...' color="outline-secondary"/>
                        :
                        <ButtonSubmit handleOnClick={handleSubmit} color="outline-secondary"/>
                    }
                </div>
            </div>
            <br />
            <div className="card pb-4">
                <div className="card-body">
                    {
                        showData ?
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped table-sm table-transaction">
                                <thead>
                                    <tr>
                                        <th colSpan={2} rowSpan={2} style={{minWidth: "350px"}}>
                                            <div className="d-flex align-items-center justify-content-center" style={{height: "57px"}}>
                                                Account
                                            </div>
                                        </th>
                                        <th colSpan={2} className="text-center left-border">Saldo Awal</th>
                                        <th colSpan={2} className="text-center left-border">Mutasi</th>
                                        <th colSpan={2} className="text-center left-border">Saldo Akhir</th>
                                    </tr>
                                    <tr>
                                        <th className="text-center left-border" style={{minWidth: "140px"}}>Debit</th><th className="text-center" style={{minWidth: "140px"}}>Credit</th>
                                        <th className="text-center left-border" style={{minWidth: "140px"}}>Debit</th><th className="text-center" style={{minWidth: "140px"}}>Credit</th>
                                        <th className="text-center left-border" style={{minWidth: "140px"}}>Debit</th><th className="text-center" style={{minWidth: "140px"}}>Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        accounts.map(account => {
                                            return(
                                                <Fragment key={account.name}>
                                                    <tr>
                                                        <td colSpan={8} className="fw-bold ps-2">{account.name}</td>
                                                    </tr>
                                                    {
                                                        account.parentAccs.map(parent =>
                                                            parent.childAccounts.map(acc => {
                                                                let {openingAmount, mutation, amount} = acc
                                                                return(
                                                                    <tr>
                                                                        <td style={{minWidth: "80px"}} className="ps-2">{acc.number}</td>
                                                                        <td>{acc.accountName}</td>
                                                                        <td className="text-end pe-2 left-border">{openingAmount > 0 && getCurrencyAbs(openingAmount)}</td>
                                                                        <td className="text-end pe-2">{openingAmount < 0 && getCurrencyAbs(openingAmount)}</td>
                                                                        <td className="text-end pe-2 left-border">{mutation > 0 && getCurrencyAbs(mutation)}</td>
                                                                        <td className="text-end pe-2">{mutation < 0 && getCurrencyAbs(mutation)}</td>
                                                                        <td className="text-end pe-2 left-border">{amount > 0 && getCurrencyAbs(amount)}</td>
                                                                        <td className="text-end pe-2">{amount < 0 && getCurrencyAbs(amount)}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        )
                                                    }
                                                </Fragment>
                                            )
                                        })
                                    }
                                    <tr className="fw-bold">
                                        <td colSpan={2} className="ps-2">Total Trial Balance</td>
                                        <td className="text-end pe-2 left-border">{totalOpening.debit > 0 && getCurrencyAbs(totalOpening.debit)}</td>
                                        <td className="text-end pe-2">{totalOpening.credit < 0 && getCurrencyAbs(totalOpening.credit)}</td>
                                        <td className="text-end pe-2 left-border">{totalMutation.debit > 0 && getCurrencyAbs(totalMutation.debit)}</td>
                                        <td className="text-end pe-2">{totalMutation.credit < 0 && getCurrencyAbs(totalMutation.credit)}</td>
                                        <td className="text-end pe-2 left-border">{totalAmount.debit > 0 && getCurrencyAbs(totalAmount.debit)}</td>
                                        <td className="text-end pe-2">{totalAmount.credit < 0 && getCurrencyAbs(totalAmount.credit)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        :
                        (
                            loading ?
                            <p>Loading...</p>
                            :
                            <p>There is no data, please submit transaction periode!!</p>
                        )
                    }
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    accounts: state.accounts,
    transactions: state.transactions,
})
const reduxDispatch = (dispatch) => ({
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    getOpeningBalanceFromAPI: () => dispatch(getOpeningBalanceFromAPI()),
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
    getClosingJournalsFromAPI: () => dispatch(getClosingJournalsFromAPI())
})

export default connect(reduxState, reduxDispatch)(TrialBalance)