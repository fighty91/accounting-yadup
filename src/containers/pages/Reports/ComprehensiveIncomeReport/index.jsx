import React, { Fragment, useEffect, useState } from "react";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import { Link } from "react-router-dom";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getCurrencyAbs, getFullDateNow } from "../../../organisms/MyFunctions/useGeneralFunc";
import { connect } from "react-redux";
import { ButtonSubmit } from "../../../../components/atoms/ButtonAndLink";
import { getAccountsFromAPI, getJournalEntriesFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../../config/redux/action";
import '../Reports.scss'

const ComprehensiveIncomeReport = (props) => {
    const [parentUnresIncome, setParentUnresIncome] = useState([])
    const [parentResIncome, setParentResIncome] = useState([])
    const [parentUnresExpense, setParentUnresExpense] = useState([])
    const [parentResExpense, setParentResExpense] = useState([])
    const [parentOtherInEx, setParentOtherInEx] = useState([])
    const [date, setDate] = useState({})
    const [dateParams, setDateParams] = useState({})
    const [showData, setShowData] = useState(false)
    const [loading, setLoading] = useState(false)

    const childAccTransAmount = async(childData, parentData) => {
        let temp = props.transactions, newTransAccs = []
        if(!temp.receiptJournal) temp.receiptJournal = await props.getReceiptJournalsFromAPI()
        if(!temp.paymentJournal) temp.paymentJournal = await props.getPaymentJournalsFromAPI()
        if(!temp.journalEntries) temp.journalEntries = await props.getJournalEntriesFromAPI()
        for(let x in temp) {
            if(x !== 'closingJournal' && x !== 'openingBalance') {
                temp[x].forEach(e => {
                    if(e.date >= date.startDate && e.date <= date.endDate) {
                        e.transAccounts.forEach(acc => newTransAccs.push(acc))
                    }
                })
            }
        }
        let newChildAccs = []
        childData.forEach(acc => {
            let amount = 0
            newTransAccs.forEach(trans => {
                let {account, debit, credit} = trans
                if(account === acc.id) amount = amount + credit - debit
            })
            amount !== 0 && newChildAccs.push({...acc, amount})
        })
        let data = parentData
        for(let x in data) {
            data[x].forEach(parentAcc => {
                parentAcc.childAccs = []
                newChildAccs.forEach(e =>
                    e.parentId === parentAcc.id && parentAcc.childAccs.push(e)
                )
            })
        }
        setParentUnresIncome(data.newParentUnresIncome)
        setParentUnresExpense(data.newParentUnresExpense)
        setParentResIncome(data.newParentResIncome)
        setParentResExpense(data.newParentResExpense)
        setParentOtherInEx(data.newParentOtherInEx)

        setTimeout(() => { // nanti buat penghitungan mundur
            setShowData(true)
            setLoading(false)
        }, 500)
    }
    const getParentAccountsAPI = (newAccount) => {
        const parentAccs = newAccount.filter(e => e.isParent),
        childAccs = newAccount.filter(e => !e.isParent && +e.categoryId >= 9)
        let data = {
            newParentUnresIncome: [], newParentUnresExpense: [],
            newParentResIncome: [], newParentResExpense: [], newParentOtherInEx: []
        }
        parentAccs.forEach(e => {
            e.categoryId === '9' && data.newParentUnresIncome.push(e)
            e.categoryId === '10' && data.newParentResIncome.push(e)
            e.categoryId === '11' && data.newParentUnresExpense.push(e)
            e.categoryId === '12' && data.newParentResExpense.push(e)
            e.categoryId === '13' && data.newParentOtherInEx.push(e) // pendapatan / beban koprehensive lainnya nanti dipisah
        })
        childAccTransAmount(childAccs, data)
    }
    const handleSubmit = async() => {
        const {startDate, endDate} = date
        if(startDate && endDate && startDate <= endDate) {
            setLoading(true)
            setShowData(false)
            let temp = props.accounts
            if(temp.length < 1) temp = await props.getAccountsFromAPI()
            if(temp.length > 0) {
                getParentAccountsAPI(temp)
            }
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

    let totalUnresIncome = 0, totalUnresExpense = 0, totalResIncome = 0, totalResExpense = 0, totalOtherInEx = 0
    return(
        <LayoutsMainContent>
            <ContentHeader name="Laporan Penghasilan Komprehensif" periode={true} />
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
                        <div className="table-responsive-sm">
                            <table className="table table-hover table-sm table-transaction">
                                <tbody>
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">TANPA PEMBATASAN DARI PEMBERI SUMBER DAYA</td>
                                        <td style={{'minWidth': '120px'}}></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold fst-italic ps-0 pe-0">Pendapatan</td>
                                    </tr>
                                    {
                                        parentUnresIncome.map(parentAccount => {
                                            let {id, accountName, childAccs} = parentAccount
                                            return(
                                                childAccs.length > 0 &&
                                                <Fragment key={id}>
                                                    {
                                                        <tr>
                                                            <td colSpan={2} className="ps-2"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{accountName}</Link></td>
                                                            <td></td>
                                                        </tr>
                                                    }
                                                    {
                                                        childAccs.map(acc => {
                                                            totalUnresIncome += acc.amount
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{acc.number}</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{acc.accountName}</Link></td>
                                                                    {
                                                                        acc.amount < 0 ?
                                                                        <td className="text-end pe-1">{`(${getCurrencyAbs(acc.amount)})`}</td>
                                                                        :
                                                                        <td className="text-end pe-2">{getCurrencyAbs(acc.amount)}</td>
                                                                    }
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Fragment>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={2} className="fw-bold fst-italic ps-0 pe-0">Total Pendapatan</td>
                                        {
                                            totalUnresIncome < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalUnresIncome)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalUnresIncome)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold fst-italic ps-0 pe-0">Beban</td>
                                    </tr>
                                    {
                                        parentUnresExpense.map(parentAccount => {
                                            let {id, accountName, childAccs} = parentAccount
                                            return(
                                                childAccs.length > 0 &&
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td colSpan={2} className="ps-2"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccs.map(acc => {
                                                            totalUnresExpense += acc.amount
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                    {
                                                                        acc.amount < 0 ?
                                                                        <td className="text-end pe-1">{`(${getCurrencyAbs(acc.amount)})`}</td>
                                                                        :
                                                                        <td className="text-end pe-2">{getCurrencyAbs(acc.amount)}</td>
                                                                    }
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Fragment>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={2} className="fw-bold fst-italic ps-0 pe-0">Total Beban</td>
                                        {
                                            totalUnresExpense < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalUnresExpense)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalUnresExpense)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Surplus (Defisit)</td>
                                        {
                                            totalUnresIncome + totalUnresExpense < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalUnresIncome + totalUnresExpense)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalUnresIncome + totalUnresExpense)}</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={3}>&nbsp;</td></tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">DENGAN PEMBATASAN DARI PEMBERI SUMBER DAYA</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold fst-italic ps-0 pe-0">Pendapatan</td>
                                    </tr>
                                    {
                                        parentResIncome.map(parentAccount => {
                                            let {id, accountName, childAccs} = parentAccount
                                            return(
                                                childAccs.length > 0 &&
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td colSpan={2} className="ps-2"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccs.map(acc => {
                                                            totalResIncome += acc.amount
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                    {
                                                                        acc.amount < 0 ?
                                                                        <td className="text-end pe-1">{`(${getCurrencyAbs(acc.amount)})`}</td>
                                                                        :
                                                                        <td className="text-end pe-2">{getCurrencyAbs(acc.amount)}</td>
                                                                    }
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Fragment>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={2} className="fw-bold fst-italic ps-0 pe-0">Total Pendapatan</td>
                                        {
                                            totalResIncome < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalResIncome)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalResIncome)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold fst-italic ps-0 pe-0">Beban</td>
                                    </tr>
                                    {
                                        parentResExpense.map(parentAccount => {
                                            let {id, accountName, childAccs} = parentAccount
                                            return(
                                                childAccs.length > 0 &&
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td colSpan={2} className="ps-2"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccs.map(acc => {
                                                            totalResExpense += acc.amount
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                    {
                                                                        acc.amount < 0 ?
                                                                        <td className="text-end pe-1">{`(${getCurrencyAbs(acc.amount)})`}</td>
                                                                        :
                                                                        <td className="text-end pe-2">{getCurrencyAbs(acc.amount)}</td>
                                                                    }
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Fragment>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={2} className="fw-bold fst-italic ps-0 pe-0">Total Beban</td>
                                        {
                                            totalResExpense < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalResExpense)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalResExpense)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Surplus (Defisit)</td>
                                        {
                                            totalResIncome + totalResExpense < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalResIncome + totalResExpense)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalResIncome + totalResExpense)}</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={3}>&nbsp;</td></tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">PENGHASILAN KOMPREHENSIF LAIN</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fst-italic ps-2 pe-0">Pendapatan dan Beban Lainnya</td>
                                    </tr>
                                    {
                                        parentOtherInEx.map(parentAccount => {
                                            let {id, childAccs} = parentAccount
                                            return(
                                                childAccs.length > 0 &&
                                                <Fragment key={id}>
                                                    
                                                    {
                                                        childAccs.map(acc => {
                                                            totalOtherInEx += acc.amount
                                                            return (
                                                                <tr key={acc.id}>
                                                                    <td className="ps-2 pe-0 account-number"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-number ps-0 pe-0 ms-0 me-0">{ acc.number }</Link></td>
                                                                    <td className="ps-2"><Link to={`/accounts/account-detail/${acc.id}?page=transactions`} className="account-name pe-0 me-0">{ acc.accountName }</Link></td>
                                                                    {
                                                                        acc.amount < 0 ?
                                                                        <td className="text-end pe-1">{`(${getCurrencyAbs(acc.amount)})`}</td>
                                                                        :
                                                                        <td className="text-end pe-2">{getCurrencyAbs(acc.amount)}</td>
                                                                    }
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Fragment>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={2} className="fw-bold fst-italic ps-0 pe-0">Total Pendapatan dan Beban Komprehensif Lain</td>
                                        {
                                            totalOtherInEx < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalOtherInEx)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalOtherInEx)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>&nbsp;</td>
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
    getJournalEntriesFromAPI: () => dispatch(getJournalEntriesFromAPI()),
    getReceiptJournalsFromAPI: () => dispatch(getReceiptJournalsFromAPI()),
    getPaymentJournalsFromAPI: () => dispatch(getPaymentJournalsFromAPI()),
})
export default connect(reduxState, reduxDispatch)(ComprehensiveIncomeReport)