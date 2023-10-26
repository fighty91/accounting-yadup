import React, { useEffect, useState } from "react";
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getAccountsFromAPI, getCategoriesFromAPI, getMappingAccountsFromAPI, updateMappingAccountsToAPI } from "../../../config/redux/action";
import { ToastAlert, lostConnection } from "../../organisms/MyFunctions/useGeneralFunc";
import './Settings.scss'

const MappingAccounts = (props) => {
    const [equityAccounts, setEquityAccounts] = useState([])
    const [parentIncomes, setParentIncomes] = useState([])
    const [parentExpenses, setParentExpenses] = useState([])
    const [mappingAccounts, setMappingAccounts] = useState({})

    const handleOnChange = async(e) => {
        if(window.navigator.onLine) {
            const {name, value} = e.target
            const res = await props.updateMappingAccountsToAPI({name, value})
            res && ToastAlert.fire({
                icon: 'success',
                title: 'Mapping updated'
            })
        } else lostConnection()
    }

    useEffect(() => {
        props.accounts.length < 1 && props.getAccountsFromAPI()
    })
    useEffect(() => {
        const accounts = props.accounts
        if(accounts.length > 0) {
            let tempEquities = [], tempIncomes = [], tempExpenses = []
            accounts.forEach(e => {
                if(e.isParent) {
                    e.categoryId === '9' && tempIncomes.push(e)
                    e.categoryId === '11' && tempExpenses.push(e)
                }
                else e.categoryId === '8' && tempEquities.push(e)
            })
            setEquityAccounts(tempEquities)
            setParentIncomes(tempIncomes)
            setParentExpenses(tempExpenses)
        }
    }, [props.accounts])

    useEffect(() => {
        let temp = props.mappingAccounts, count = 0
        for(let x in temp) {temp[x] && count++}
        count < 1 && props.getMappingAccountsFromAPI()
    }, [])
    useEffect(() => {
        let temp = props.mappingAccounts, count = 0
        for(let x in temp) {temp[x] && count++}
        count > 0 && setMappingAccounts(temp)
    }, [props.mappingAccounts])

    return(
        <LayoutsMainContent>
            <ContentHeader name="Mapping Accounts"/>
            {/* Entry Content */}
            <div className="row mb-3">
                <label htmlFor="unrestrictedNetAsset" className="col-sm-3 col-form-label">Unrestricted Net Asset</label>
                <div className="col-sm-9">
                    <select className="form-select form-select-sm" id="unrestrictedNetAsset" value={mappingAccounts.unrestrictedNetAsset} name="unrestrictedNetAsset" onChange={handleOnChange}>
                        <option value=''>Choose...</option>
                        {
                            equityAccounts.map((account, i) =>
                                <option key={i} value={account.id}>
                                    {account.number}&nbsp;&nbsp;&nbsp;{account.accountName}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <label htmlFor="restrictedNetAsset" className="col-sm-3 col-form-label">Restricted Net Asset</label>
                <div className="col-sm-9">
                    <select className="form-select form-select-sm" id="restrictedNetAsset" value={mappingAccounts.restrictedNetAsset} name="restrictedNetAsset" onChange={handleOnChange}>
                        <option value=''>Choose...</option>
                        {
                            equityAccounts.map((account, i) =>
                                <option key={i} value={account.id}>
                                    {account.number}&nbsp;&nbsp;&nbsp;{account.accountName}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <label htmlFor="unrestrictedIncome" className="col-sm-3 col-form-label">Unrestricted Income</label>
                <div className="col-sm-9">
                    <select className="form-select form-select-sm" id="unrestrictedIncome" value={mappingAccounts.unrestrictedIncome} name="unrestrictedIncome" onChange={handleOnChange}>
                        <option value=''>Choose...</option>
                        {
                            parentIncomes.map((account, i) =>
                                <option key={i} value={account.id}>
                                    {account.number}&nbsp;&nbsp;&nbsp;{account.accountName}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <label htmlFor="restrictedIncome" className="col-sm-3 col-form-label">Restricted Income</label>
                <div className="col-sm-9">
                    <select className="form-select form-select-sm" id="restrictedIncome" value={mappingAccounts.restrictedIncome} name="restrictedIncome" onChange={handleOnChange}>
                        <option value=''>Choose...</option>
                        {
                            parentIncomes.map((account, i) =>
                                <option key={i} value={account.id}>
                                    {account.number}&nbsp;&nbsp;&nbsp;{account.accountName}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <label htmlFor="unrestrictedExpense" className="col-sm-3 col-form-label">Unrestricted Expense</label>
                <div className="col-sm-9">
                    <select className="form-select form-select-sm" id="unrestrictedExpense" value={mappingAccounts.unrestrictedExpense} name="unrestrictedExpense" onChange={handleOnChange}>
                        <option value=''>Choose...</option>
                        {
                            parentExpenses.map((account, i) =>
                                <option key={i} value={account.id}>
                                    {account.number}&nbsp;&nbsp;&nbsp;{account.accountName}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <label htmlFor="restrictedExpense" className="col-sm-3 col-form-label">Restricted Expense</label>
                <div className="col-sm-9">
                    <select className="form-select form-select-sm" id="restrictedExpense" value={mappingAccounts.restrictedExpense} name="restrictedExpense" onChange={handleOnChange}>
                        <option value=''>Choose...</option>
                        {
                            parentExpenses.map((account, i) =>
                                <option key={i} value={account.id}>
                                    {account.number}&nbsp;&nbsp;&nbsp;{account.accountName}
                                </option>
                            )
                        }
                    </select>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    categories: state.categories,
    accounts: state.accounts,
    mappingAccounts: state.mappingAccounts
})
const reduxDispatch = (dispatch) => ({
    getCategoriesFromAPI: () => dispatch(getCategoriesFromAPI()),
    getAccountsFromAPI: () => dispatch(getAccountsFromAPI()),
    updateMappingAccountsToAPI: (data) => dispatch(updateMappingAccountsToAPI(data)),
    getMappingAccountsFromAPI: () => dispatch(getMappingAccountsFromAPI())
})
export default connect(reduxState, reduxDispatch)(MappingAccounts)