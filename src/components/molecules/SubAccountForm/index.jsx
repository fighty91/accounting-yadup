import React, { Fragment } from "react";
import InputValidation from "../../atoms/InputValidation";

const FormSubAccount = (props) => {
    const {accountType, account, parentAccounts, nullValid, accumulationType, masterAmortization, masterDepreciaton, categoryId} = props.data
    const {handleAccountType, handleEntryAccount, handleEntryAccumulation, handleKeyEnter} = props.handleSubFunc
    const {subOnly, parentOnly, accumOnly, fixParent, limitParent} = props.mappingRole || {}
    return (
        <Fragment>
            <div className="d-sm-inline-flex g-3 mb-3">
                {
                    !parentOnly && !accumOnly &&
                    <div className="form-check me-4 mb-2">
                        <input className="form-check-input" type="radio" name="accountType" id="subAccount" value="subAccount" onChange={(e)=>handleAccountType(e)} checked={accountType === 'subAccount' && true} disabled={subOnly} onKeyUp={(e)=>handleKeyEnter(e)} />
                        <label className="form-check-label" htmlFor="subAccount" >
                            Sub Account
                        </label>
                    </div>
                }
                {
                    !subOnly && !accumOnly &&
                    <div className="form-check me-4 mb-2">
                        <input className="form-check-input" type="radio" name="accountType" id="isParent" value="isParent" onChange={(e)=>handleAccountType(e)} checked={accountType === 'isParent' && true} disabled={parentOnly} onKeyUp={(e)=>handleKeyEnter(e)} />
                        <label className="form-check-label" htmlFor="isParent">
                            Parent Account
                        </label>
                    </div>
                }
                {
                    !subOnly && !parentOnly &&
                    <div className="form-check mb-2">
                        <input className="form-check-input" type="radio" name="accountType" id="isAccumulation" value="isAccumulation" onChange={(e)=>handleAccountType(e)} checked={accountType === 'isAccumulation' && true} disabled={accumOnly} onKeyUp={(e)=>handleKeyEnter(e)} />
                        <label className="form-check-label" htmlFor="isAccumulation">
                            Accumulation
                        </label>
                    </div>
                }
            </div>

            <div className="row g-3 mb-5">
                {
                    accountType === 'subAccount' && 
                    <div className="col-md-6">
                        <label htmlFor="parentId" className="">Sub Account From</label>
                        <select className="form-select form-select-sm" id="parentId" name="parentId" value={account.parentId && account.parentId} onChange={(e)=>handleEntryAccount(e)} disabled={fixParent} >
                            {!account.parentId && <option value={0}>Choose...</option>}
                            {
                                fixParent ?
                                parentAccounts.map(e => e.id === account.parentId && <option key={e.id} value={e.id}>{e.number} &nbsp; {e.accountName}</option>)
                                :
                                (
                                    limitParent ?
                                    parentAccounts.map(e => e.id !== account.id && e.categoryId === categoryId && <option key={e.id} value={e.id}>{e.number} &nbsp; {e.accountName}</option>)
                                    :
                                    parentAccounts.map(e => e.id !== account.id && <option key={e.id} value={e.id}>{e.number} &nbsp; {e.accountName}</option>)
                                )
                            }
                        </select>
                        {nullValid.parent && <InputValidation name="sub account from null" />}
                    </div>
                }
                {
                    accountType === 'isAccumulation' && !accumOnly &&
                    <div className="col-md-6">
                        <label htmlFor="accumulationType" className="">Type</label>
                        <select className="form-select form-select-sm" id="accumulationType" name="accumulationType" value={accumulationType} onChange={(e)=>handleEntryAccumulation(e)} >
                            {!accumulationType && <option value=''>Choose...</option>}
                            <option value='isDepreciation'>Depreciation</option>
                            <option value='isAmortization'>Amortization</option>
                        </select>
                        {nullValid.accumType && <InputValidation name="type null" />}
                    </div>
                }
                {
                    accumulationType === 'isDepreciation' && 
                    <div className="col-md-6">
                        <label htmlFor="masterId" className="">Depreciation From</label>
                        <select className="form-select form-select-sm" id="masterId" name="masterId" onChange={(e)=>handleEntryAccount(e)} value={account.masterId && account.masterId} disabled={accumOnly} >
                            {!account.masterId && <option value=''>Choose...</option>}
                            {
                                accumOnly ?
                                masterDepreciaton.map(e => e.id === account.masterId && <option key={e.id} value={e.id}>{ e.number } &nbsp; { e.accountName }</option> ) :

                                masterDepreciaton.map(e => e.id !== account.id && <option key={e.id} value={e.id}>{ e.number } &nbsp; { e.accountName }</option> )
                            }
                        </select>
                        {nullValid.accumMaster && <InputValidation name="depreciation from null" />}
                    </div>
                }
                {
                    accumulationType === 'isAmortization' && 
                    <div className="col-md-6">
                        <label htmlFor="masterId" className="">Amortization From</label>
                        <select className="form-select form-select-sm" id="masterId" name="masterId" onChange={(e)=>handleEntryAccount(e)} value={account.masterId && account.masterId} disabled={accumOnly} >
                            {!account.masterId && <option value=''>Choose...</option>}
                            { 
                                accumOnly ?
                                    masterAmortization.map(e => 
                                        e.id === account.masterId &&
                                        <option key={e.id} value={e.id}>
                                            { e.number } &nbsp; { e.accountName }
                                        </option>
                                    ) 
                                    :
                                    masterAmortization.map(e => 
                                        e.id !== account.id && 
                                        <option key={e.id} value={e.id}>
                                            { e.number } &nbsp; { e.accountName }
                                        </option>
                                    ) 
                            }
                        </select>
                        {nullValid.accumMaster && <InputValidation name="amortization from null" />}
                    </div>
                }
            </div>
        </Fragment>
    )
}

export default FormSubAccount