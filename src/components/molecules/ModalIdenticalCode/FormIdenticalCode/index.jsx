import React, { Fragment } from "react";
import InputValidation from "../../../atoms/InputValidation";
import ButtonCreate from "../../../atoms/ButtonCreate";
import './FormIdenticalCode.css'

const FormIdenticalCode = (props) => {
    const { handleCreate, handleInput, data} = props
    const [identical, identicalAvailable, lastCharDigit, lastInitialSpace, firstInitialSpace] = data
    const handleKeyEnter = (event) => {
        event.code === 'Enter' && handleCreate()
    }

    return (
        <Fragment>
            <div className="row g-3 pe-3 ps-3 mb-3">
                <hr className="mt-2 mb-0"/>
                <div className="col-sm-8">
                <label htmlFor="initialCode" className="form-label mb-0 form-number-format">Initial Code</label>
                    <input type="text" onKeyUp={(e)=>handleKeyEnter(e)} className={"form-control form-control-sm"} placeholder="..." aria-label="initial-code" value={identical.initialCode} onChange={handleInput} name="initialCode" id="initialCode" autoComplete="off"/>
                </div>
                <div className="col-sm-4">
                    <label htmlFor="startFrom" className="form-label mb-0 form-number-format">Start From</label>
                    <input type="number" onKeyUp={(e)=>handleKeyEnter(e)} className={"form-control form-control-sm"} placeholder="..." aria-label="start-from" value={identical.startFrom} onChange={handleInput} name="startFrom" id="startFrom" min="0" autoComplete="off"/>
                </div>
                
                { !identicalAvailable && <InputValidation name="not available, initial code already exist" /> }
                { lastCharDigit && <InputValidation name="don't use digit on last initial character!!" /> }
                { lastInitialSpace && <InputValidation name="don't use space on last initial character!!" /> }
                { firstInitialSpace && <InputValidation name="don't use space on first initial character!!" /> }
                <div>
                    {
                        identicalAvailable && !lastCharDigit && !lastInitialSpace & !firstInitialSpace ?
                        <ButtonCreate handleOnClick={handleCreate} disabled={false} /> :
                        <ButtonCreate disabled={true} />
                    }
                </div>
            </div>
        </Fragment>
    )
}

export default FormIdenticalCode