import React, { useState } from "react";
import InputValidation from "../../atoms/InputValidation";
// import { useGeneralFunc } from "../../../utils/MyFunction/MyFunction";
import { getCurrency, getNormalNumb } from "../../../containers/organisms/MyFunctions/useGeneralFunc";

const RowFormPaymentJournal = (props) => {
    const [accountNumberAndName, setAccountNumberAndName] = useState('')
    const handleFocusInputNumb = (event) => {
        const {value, name, id} = event.target
        const temp = value === '' ? '' : getNormalNumb(value)
        updateInputNumber(temp, id, name)
    }
    const handleBlurInputNumb = (event) => {
        event.target.setAttribute('type', 'text')
        const {value, name, id} = event.target
        const temp = value === '' ? '' : getCurrency(value)
        updateInputNumber(temp, id, name)
    }
    const handleEntryInputNumb = (event) => {
        event.target.setAttribute('type', 'number')
        let { value, name, id } = event.target
        let temp = +value
        updateInputNumber(temp, id, name)
    }
    const updateInputNumber = (temp, id, name) => {
        const row = +id.slice(3)
        let newAccountTransactions = [...accountTransactions]
        newAccountTransactions.forEach((e, i) => { if(i === row) e[name] = temp })
        setAccountTransactions(newAccountTransactions)
    }

    const handleKeyEnter = async (event) => {
        if(event.code === 'Enter') {
            await event.target.blur()
            await handleSubmit()
        }
    }

    const getNumberAndNameShow = (e) => {
        const accountId = e.target.value
        let numberAndName = ''
        if(accountId) {
            const newAccount = accounts.find(e => e.id === accountId)
            if(newAccount) {
                const {number, accountName} = newAccount
                numberAndName = `${number}  ${accountName}`
            }
        }
        setAccountNumberAndName(numberAndName)
    }
    
    const {handleEntryAccount, handleDeleteRow, setAccountTransactions, handleSubmit} = props.rowFormFunc
    const {row, account, accounts, description, debit, credit, formValidation, parentAccounts, accountTransactions} = props.data
    const [nominalNull, accountNull] = formValidation
    
    let nominalProblem = false
    if(nominalNull) nominalProblem = true

    return(
        <tr>
            <td className="ps-0 pe-0">
                <label htmlFor={'ac-'+row} className="visually-hidden">Account</label>
                <select name="account" id={'ac-'+row} className={`form-select form-select-sm ${accountNull === true && 'border-danger'} account`} onChange={(e)=>handleEntryAccount(e)} value={account} title={accountNumberAndName} onMouseEnter={getNumberAndNameShow}>
                    <option value="">Choose...</option>
                    {
                        parentAccounts.map(pAcc => 
                            pAcc.categoryId > 1 &&
                            <optgroup label={pAcc.accountName} key={pAcc.id}>
                                {
                                    accounts.map(acc => 
                                        pAcc.id === acc.parentId &&
                                        <option key={acc.id} value={acc.id}>{acc.number} &nbsp; {acc.accountName}</option>
                                    )
                                }
                            </optgroup>
                        )
                    }
                </select>
                {accountNull && <InputValidation name="account null" /> }
            </td>
            <td>
                <label htmlFor={'dc-'+row} className="visually-hidden">Description</label>
                <input type="text" name="description" id={'dc-'+row} className="form-control form-control-sm description" onChange={(e) => handleEntryAccount(e)} value={description} autoComplete="off" title={description} />
            </td>
            <td>
                <label htmlFor={'db-'+row} className={`visually-hidden `}>Debit</label>
                <input type="text" name="debit" id={'db-'+row} min={0} className={`form-control form-control-sm text-end debit ${nominalProblem === true && 'border-danger'} account-value`} 
                value={debit} 
                onChange={handleEntryInputNumb} 
                onFocus={handleFocusInputNumb} 
                onBlur={handleBlurInputNumb} 
                onKeyUp={handleKeyEnter} autoComplete="off" title={debit} />
                {nominalNull && <InputValidation name="nominal null" /> }
            </td>
            <td>
                <button className="btn btn-outline-danger btn-sm delete-row" id={'dl-'+row} onClick={() => handleDeleteRow(row)}>&minus;</button>
            </td>
        </tr>
    )
}

export default RowFormPaymentJournal