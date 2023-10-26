import React, { Fragment, useState } from "react";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getCurrencyAbs, getFullDateNow } from "../../../organisms/MyFunctions/useGeneralFunc";
import { connect } from "react-redux";
import { ButtonSubmit } from "../../../../components/atoms/ButtonAndLink";
import { getAccountsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../../config/redux/action";
import { Link } from "react-router-dom";
import '../Reports.scss'

const BalanceSheet = (props) => {
    const [date, setDate] = useState({})
    const [dateParams, setDateParams] = useState({})
    const [showData, setShowData] = useState(false)
    const [loading, setLoading] = useState(false)
    const [parentCurrentAssets, setParentCurrentAssets] = useState([])
    const [parentNonCurrentAssets, setParentNonCurrentAssets] = useState([])
    const [parentLiabilities, setParentLiabilities] = useState([])
    const [parentEquity, setParentEquity] = useState([])
    
    const getParentAccounts = (childData, parentData) => {
        let newParentAccounts = []
        parentData.forEach(parent => {
            let childAccounts = []
            childData.forEach(acc =>
                acc.parentId === parent.id && childAccounts.push(acc)
            )
            childAccounts.length > 0 && newParentAccounts.push({...parent, childAccounts})
        })
        let newParentCurrentAssets = [], newParentNonCurrentAssets = [],
        newParentLiabilities = [], newParentEquity = [], newParentIncomeExpense = []
        newParentAccounts.forEach(e => {
            newParentAccounts.push(e)
            e.categoryId <= 3 && newParentCurrentAssets.push(e)
            e.categoryId >= 4 && e.categoryId <= 6 && newParentNonCurrentAssets.push(e)
            e.categoryId === '7' && newParentLiabilities.push(e)
            e.categoryId === '8' && newParentEquity.push(e)
            e.categoryId > 8 && newParentIncomeExpense.push(e)
        })
        setParentCurrentAssets(newParentCurrentAssets)
        setParentNonCurrentAssets(newParentNonCurrentAssets)
        setParentLiabilities(newParentLiabilities)
        setParentEquity(newParentEquity)

        setTimeout(() => { // nanti buat penghitungan mundur
            setShowData(true)
            setLoading(false)
        }, 500)
    }
    const getChildTransAmount = (newAccounts, newTransactions) => {
        let tempTransactions = newTransactions,
        childData = newAccounts.filter(e => !e.isParent),
        parentData = newAccounts.filter(e => e.isParent && +e.categoryId < 9),
        unresProfit = 0, resProfit = 0
        childData.forEach(acc => {
            acc.amount = 0
            let {id, categoryId} = acc
            tempTransactions.forEach(trans => {
                let {account, debit, credit} = trans
                if(account === id) {
                    if(+categoryId > 8) {
                        categoryId === '10' || categoryId === '12' ?
                        resProfit = resProfit + credit - debit : unresProfit = unresProfit + credit - debit
                    }
                    else if(+categoryId > 6) acc.amount = acc.amount + credit - debit // liabiitas dan ekuitas
                    else acc.amount = acc.amount + debit - credit
                }
            })
        })
        let childAccounts = []
        childData.forEach(acc => {
            let {amount, id} = acc
            if(id === 'unresNetAssets' ) childAccounts.push({...acc, amount: amount + unresProfit})
            else if(id === 'resNetAssets') childAccounts.push({...acc, amount: amount + resProfit})
            else amount !== 0 && childAccounts.push(acc)
        })
        getParentAccounts(childAccounts, parentData)
    }
    const getTransactions = async(newAccounts) => {
        let temp = props.transactions, tempTransactions = []
        if(!temp.openingBalance) temp.openingBalance = await props.getOpeningBalanceFromAPI()
        if(!temp.receiptJournal) temp.receiptJournal = await props.getReceiptJournalsFromAPI()
        if(!temp.paymentJournal) temp.paymentJournal = await props.getPaymentJournalsFromAPI()
        if(!temp.journalEntries) temp.journalEntries = await props.getJournalEntriesFromAPI()
        for(let x in temp) {
            if(x !== 'closingJournal')
            temp[x].forEach(e =>
                e.date <= date.endDate && e.transAccounts.forEach(acc =>
                    tempTransactions.push(acc)
                )
            )
        }
        getChildTransAmount(newAccounts, tempTransactions)
    }
    const handleSubmit = async() => {
        if(date.endDate) {
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

    let totalCurrentAsset = 0, totalNonCurrentAsset = 0, totalLiabilities = 0, totalEquity = 0
    return(
        <LayoutsMainContent>
            <ContentHeader name="Laporan Neraca" periode={true} />
            <div className="row g-3 mb-2">
                <div className="col-sm-auto col-md-4 col-lg-3 col-xl-2">
                    <label htmlFor="date" className="form-label mb-0">
                        <small>Date</small>
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
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">ASET</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Aset Lancar</td>
                                    </tr>
                                    {
                                        parentCurrentAssets.map(parentAccount => {
                                            let {id, number, accountName, childAccounts} = parentAccount
                                            return(
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            totalCurrentAsset += acc.amount
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
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Aset Lancar</td>
                                        {
                                            totalCurrentAsset < 0 ?
                                            <td className="text-end fw-bold pe-2 table-total">{`(${getCurrencyAbs(totalCurrentAsset)})`}</td>
                                            :
                                            <td className="text-end fw-bold pe-2 table-total">{getCurrencyAbs(totalCurrentAsset)}</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={3}>&nbsp;</td></tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Aset Tidak Lancar</td>
                                    </tr>
                                    {
                                        parentNonCurrentAssets.map(parentAccount => {
                                            let {id, number, accountName, childAccounts} = parentAccount
                                            return(
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            totalNonCurrentAsset += acc.amount
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
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Aset Tidak Lancar</td>
                                        {
                                            totalNonCurrentAsset < 0 ?
                                            <td className="text-end fw-bold pe-2">{`(${getCurrencyAbs(totalNonCurrentAsset)})`}</td>
                                            :
                                            <td className="text-end fw-bold pe-2">{getCurrencyAbs(totalNonCurrentAsset)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">TOTAL ASET</td>
                                        {
                                            totalCurrentAsset + totalNonCurrentAsset < 0 ?
                                            <td className="text-end fw-bold pe-2 table-total" style={{'minWidth': '120px'}}>{`(${getCurrencyAbs(totalCurrentAsset + totalNonCurrentAsset)})`}</td>
                                            :
                                            <td className="text-end fw-bold pe-2 table-total" style={{'minWidth': '120px'}}>{getCurrencyAbs(totalCurrentAsset + totalNonCurrentAsset)}</td>

                                        }
                                    </tr>
                                    <tr><td colSpan={3}>&nbsp;</td></tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">LIABILITAS DAN EKUITAS</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Liabilitas</td>
                                    </tr>
                                    {
                                        parentLiabilities.map(parentAccount => {
                                            let {id, number, accountName, childAccounts} = parentAccount
                                            return(
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            totalLiabilities += acc.amount
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
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Liabilitas</td>
                                        {
                                            totalLiabilities < 0 ?
                                            <td className="text-end fw-bold pe-2 table-total">{`(${getCurrencyAbs(totalLiabilities)})`}</td>
                                            :
                                            <td className="text-end fw-bold pe-2 table-total">{getCurrencyAbs(totalLiabilities)}</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={3}>&nbsp;</td></tr>
                                    <tr>
                                        <td colSpan={3} className="fw-bold ps-0 pe-0">Ekuitas</td>
                                    </tr>
                                    {
                                        parentEquity.map(parentAccount => {
                                            let {id, number, accountName, childAccounts} = parentAccount
                                            return (
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className="fw-bold ps-0 pe-0 account-number"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-number ps-0 pe-0 ms-0 me-0">{ number }</Link></td>
                                                        <td className="fw-bold ps-0"><Link to={`/accounts/account-detail/${id}?page=profile`} className="account-name pe-0 me-0">{ accountName }</Link></td>
                                                        <td></td>
                                                    </tr>
                                                    {
                                                        childAccounts.map(acc => {
                                                            totalEquity += acc.amount
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
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">Total Ekuitas</td>
                                        {
                                            totalEquity < 0 ?
                                            <td className="text-end fw-bold pe-2 table-total">{`(${getCurrencyAbs(totalEquity)})`}</td>
                                            :
                                            <td className="text-end fw-bold pe-2 table-total">{getCurrencyAbs(totalEquity)}</td>
                                        }
                                    </tr>
                                    <tr>
                                    <td colSpan={2} className="fw-bold ps-0 pe-0">TOTAL LIABILITAS DAN EKUITAS</td>
                                        {
                                            totalLiabilities + totalEquity < 0 ?
                                            <td className="text-end fw-bold pe-2 table-total">{`(${getCurrencyAbs(totalLiabilities + totalEquity)})`}</td>
                                            :
                                            <td className="text-end fw-bold pe-2 table-total">{getCurrencyAbs(totalLiabilities + totalEquity)}</td>
                                        }
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
})

export default connect(reduxState, reduxDispatch)(BalanceSheet)