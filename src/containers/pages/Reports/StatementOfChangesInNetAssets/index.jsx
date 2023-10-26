import React, { useState } from "react";
import ContentHeader from "../../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../../organisms/Layouts/LayoutMainContent";
import { getCurrencyAbs, getFullDateNow } from "../../../organisms/MyFunctions/useGeneralFunc";
import { connect } from "react-redux";
import { ButtonSubmit } from "../../../../components/atoms/ButtonAndLink";
import { getAccountsFromAPI, getClosingJournalsFromAPI, getJournalEntriesFromAPI, getOpeningBalanceFromAPI, getPaymentJournalsFromAPI, getReceiptJournalsFromAPI } from "../../../../config/redux/action";
import '../Reports.scss'

const StatementOfChangeInNetAssets = (props) => {
    const [date, setDate] = useState({})
    const [dateParams, setDateParams] = useState({})
    const [showData, setShowData] = useState(false)
    const [loading, setLoading] = useState(false)
    const [openingAmount, setOpeningAmount] = useState({resOpening: 0, unresOpening: 0})
    const [profitAmount, setProfitAmount] = useState({resProfit: 0, unresProfit: 0, otherProfit: 0})
    const [addAmount, setAddAmount] = useState({resAdd: 0, unresAdd: 0})

    const getTransAmount = (childData, normalTrans, openingTrans) => {
        let unresOpening = 0, resOpening = 0, unresProfit = 0, resProfit = 0, otherProfit = 0, unresAdd = 0, resAdd = 0
        childData.forEach(acc => {
            normalTrans.forEach(trans => {
                let {account, debit, credit} = trans
                if(account === acc.id) {
                    if(acc.categoryId === '9' || acc.categoryId === '11') unresProfit = unresProfit + credit - debit
                    else if(acc.categoryId === '13') otherProfit = otherProfit + credit - debit
                    else resProfit = resProfit + credit - debit
                }
            })
            openingTrans.forEach(trans => {
                let {account, debit, credit} = trans
                if(account === acc.id) {
                    acc.categoryId === '9' || acc.categoryId === '11' || acc.categoryId === '13' ?
                    unresOpening = unresOpening + credit - debit : resOpening = resOpening + credit - debit
                }
            })
        })
        normalTrans.forEach(trans => {
            let {account, debit, credit} = trans
            if(account === 'unresNetAssets') unresAdd = unresAdd + credit - debit
            if(account === 'resNetAssets') resAdd = resAdd + credit - debit
        })
        setOpeningAmount({unresOpening, resOpening})
        setProfitAmount({unresProfit, resProfit, otherProfit})
        setAddAmount({unresAdd, resAdd})

        setTimeout(() => { // nanti buat penghitungan mundur, ok!!
            setShowData(true)
            setLoading(false)
        }, 500)
    }
    const getTransactions = async(childData) => {
        let temp = props.transactions, normalTrans = [], openingTrans = [], closingTrans = []
        if(!temp.openingBalance) temp.openingBalance = await props.getOpeningBalanceFromAPI()
        if(!temp.receiptJournal) temp.receiptJournal = await props.getReceiptJournalsFromAPI()
        if(!temp.paymentJournal) temp.paymentJournal = await props.getPaymentJournalsFromAPI()
        if(!temp.journalEntries) temp.journalEntries = await props.getJournalEntriesFromAPI()
        // if(!temp.closingJournal) temp.closingJournal = await props.getClosingJournalsFromAPI()

        for(let x in temp) {
            if(x === 'openingBalance') {
                temp[x].forEach(e => {
                    e.date < date.startDate && e.transAccounts.forEach(acc => openingTrans.push(acc))
                })
            } else if(x === 'closingJournal') { // dicheck kembali nanti
                temp[x].forEach(e => {
                    e.date < date.startDate &&
                    e.transAccounts.forEach(acc => closingTrans.push(acc))
                })
            } else {
                temp[x].forEach(e => {
                    e.date >= date.startDate && e.date <= date.endDate && e.transAccounts.forEach(acc => normalTrans.push(acc))
                    e.date < date.startDate && e.transAccounts.forEach(acc => openingTrans.push(acc))
                })
            }
        }
        getTransAmount(childData, normalTrans, openingTrans)
    }
    const handleSubmit = async() => {
        const {startDate, endDate} = date
        if(startDate && endDate && startDate <= endDate) {
            setLoading(true)
            setShowData(false)
            let temp = props.accounts
            if(temp.length < 1) temp = await props.getAccountsFromAPI()
            if(temp.length > 0) {
                const childAccs = temp.filter(e => !e.isParent && +e.categoryId >= 9)
                getTransactions(childAccs)
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

    let totalUnresNetAssets = openingAmount.unresOpening + profitAmount.unresProfit + addAmount.unresAdd,
    totalResNetAssets = openingAmount.resOpening + profitAmount.resProfit + addAmount.resAdd
    return(
        <LayoutsMainContent>
            <ContentHeader name="Laporan Perubahan Aset Neto" periode={true} />
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
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">ASET NETO TANPA PEMBATASAN DARI PEMBERI SUMBER DAYA</td>
                                    </tr>
                                    <tr>
                                        <td className="ps-0 pe-0">Saldo Awal</td>
                                        {
                                            openingAmount.unresOpening < 0 ?
                                            <td className="text-end pe-1" style={{'minWidth': '120px'}}>{`(${getCurrencyAbs(openingAmount.unresOpening)})`}</td>
                                            :
                                            <td className="text-end pe-2" style={{'minWidth': '120px'}}>{getCurrencyAbs(openingAmount.unresOpening)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="fst-italic ps-0 pe-0">Surplus (Defisit) Periode Berjalan</td>
                                        {
                                            profitAmount.unresProfit < 0 ?
                                            <td className="text-end pe-1">{`(${getCurrencyAbs(profitAmount.unresProfit)})`}</td>
                                            :
                                            <td className="text-end pe-2">{getCurrencyAbs(profitAmount.unresProfit)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="ps-0 pe-0">Aset neto yang ditambahkan (dibebaskan)</td>
                                        {
                                            addAmount.unresAdd < 0 ?
                                            <td className="text-end pe-1">{`(${getCurrencyAbs(addAmount.unresAdd)})`}</td>
                                            :
                                            <td className="text-end pe-2">{getCurrencyAbs(addAmount.unresAdd)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="fw-bold ps-0 pe-0">Saldo Sebelum Penghasilan Komprehensif Lain</td>
                                        {
                                            totalUnresNetAssets < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalUnresNetAssets)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalUnresNetAssets)}</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={2}>&nbsp;</td></tr>
                                    <tr>
                                        <td colSpan={2} className="fw-bold fst-italic ps-0 pe-0">Penghasilan Komprehensif Lain</td>
                                    </tr>
                                    <tr>
                                        <td className="ps-0 pe-0">Pendapatan (Beban) Komprehensif Lainnya Periode Berjalan</td>
                                        {
                                            profitAmount.otherProfit < 0 ?
                                            <td className="text-end pe-1" style={{minWidth: '120px'}}>{`(${getCurrencyAbs(profitAmount.otherProfit)})`}</td>
                                            :
                                            <td className="text-end pe-2" style={{minWidth: '120px'}}>{getCurrencyAbs(profitAmount.otherProfit)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="fw-bold ps-0 pe-0">Total Aset Neto Tanpa Pembatasan</td>
                                        {
                                            totalUnresNetAssets + profitAmount.otherProfit < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalUnresNetAssets + profitAmount.otherProfit)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalUnresNetAssets + profitAmount.otherProfit)}</td>
                                        }
                                    </tr>
                                    <tr><td colSpan={2}>&nbsp;</td></tr>

                                    <tr>
                                        <td colSpan={2} className="fw-bold ps-0 pe-0">ASET NETO DENGAN PEMBATASAN DARI PEMBERI SUMBER DAYA</td>
                                    </tr>
                                    <tr>
                                        <td className="ps-0 pe-0">Saldo Awal</td>
                                        {
                                            openingAmount.resOpening < 0 ?
                                            <td className="text-end pe-1">{`(${getCurrencyAbs(openingAmount.resOpening)})`}</td>
                                            :
                                            <td className="text-end pe-2">{getCurrencyAbs(openingAmount.resOpening)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="fst-italic ps-0 pe-0">Surplus (Defisit) Periode Berjalan</td>
                                        {
                                            profitAmount.resProfit < 0 ?
                                            <td className="text-end pe-1">{`(${getCurrencyAbs(profitAmount.resProfit)})`}</td>
                                            :
                                            <td className="text-end pe-2">{getCurrencyAbs(profitAmount.resProfit)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="ps-0 pe-0">Aset neto yang ditambahkan (dibebaskan)</td>
                                        {
                                            addAmount.resAdd < 0 ?
                                            <td className="text-end pe-1">{`(${getCurrencyAbs(addAmount.resAdd)})`}</td>
                                            :
                                            <td className="text-end pe-2">{getCurrencyAbs(addAmount.resAdd)}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="fw-bold ps-0 pe-0">Total Aset Neto Dengan Pembatasan</td>
                                        {
                                            totalResNetAssets < 0 ?
                                            <td className="text-end fw-bold table-total pe-1">{`(${getCurrencyAbs(totalResNetAssets)})`}</td>
                                            :
                                            <td className="text-end fw-bold table-total pe-2">{getCurrencyAbs(totalResNetAssets)}</td>
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
    getClosingJournalsFromAPI: () => dispatch(getClosingJournalsFromAPI()),
})

export default connect(reduxState, reduxDispatch)(StatementOfChangeInNetAssets)