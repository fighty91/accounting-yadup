import React, { useEffect } from "react";
import IdenticalCodeList from "./IdenticalCodeList";
import FormIdenticalCode from "./FormIdenticalCode";
import { useIdenticalFunc } from "../../../utils/MyFunction/MyFunction";

const ModalIdenticalCode = (props) => {
    const { getIdenticalCode, putIdenticalAPI } = useIdenticalFunc()

    const handleUseIdentical = async (data) => {
        let newIdenticalCode = {...identicalCode}
        for(let x in data) { 
            if(x !== 'defaultCode') newIdenticalCode[x] = data[x] 
        }
        await setIdentical(newIdenticalCode)
        await putIdenticalAPI(newIdenticalCode)
    }

    const handleDeleteIdentical = async (row) => {
        let newCodeList = [...codeList]
        let newIdenticalCode = {...identicalCode}
        newCodeList.splice(row,1)
        newIdenticalCode.codeList = newCodeList
        await setIdentical(newIdenticalCode)
        await putIdenticalAPI(newIdenticalCode)
    }

    const handleCreateIdentical = async () => {
        const identicalCodeAPI = await getIdenticalCode()
        let newCodeList = [...identicalCodeAPI.codeList]
        let newFormIdentical = {...formIdentical}
        
        if(newFormIdentical.startFrom === '' || newFormIdentical.startFrom === 0) newFormIdentical.startFrom = 1
        let approve = true
        newCodeList.forEach(e => {
            if(e.initialCode === newFormIdentical.initialCode) {
                setAvailable(false)
                approve = false
            }
        })
        
        let newIdenticalCode = {...identicalCodeAPI}
        if(approve) {
            newCodeList.push(newFormIdentical)
            newIdenticalCode.codeList = newCodeList
            await putIdenticalAPI(newIdenticalCode)
            await getResetFormIdentical()
        }
        await setIdentical(newIdenticalCode)
    }

    const getSetIdenticalCode = async () => {
        const newIdentical = await getIdenticalCode()
        setIdentical(newIdentical)
    }

    const handleShowFormIdentical = () => {
        setShowForm(showFormIdentic ? false : true)
    }

    const handleInputIdentical = (data) => {
        setAvailable(true)
        let newFormIdentical = {...formIdentical}
        let {name, value} = data.target
        if (name === 'startFrom') {
            const startNumb = +value
            if(startNumb % 1 === 0) newFormIdentical[name] = startNumb
        } else {
            newFormIdentical[name] = value
            const lastChar = +value.charAt(value.length-1) + 1
            value !== '' && lastChar > 0 ? setLastInitialDigit(true) : setLastInitialDigit(false)
        }
        setFormIdentical(newFormIdentical)

        let newCodeList = [...identicalCode.codeList]
        newCodeList.forEach(e => {
            e.initialCode === newFormIdentical.initialCode && setAvailable(false)
        })
    }

    useEffect(()=> {
        getSetIdenticalCode()
    }, [])

    const {identicalCode, showFormIdentic, formIdentical, identicalAvailable, lastInitialDigit} = props.data
    const {codeList} = identicalCode
    const {setIdentical, setAvailable, setShowForm, setLastInitialDigit, setFormIdentical, getResetFormIdentical} = props.identicalState
    return (
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Identical Code</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <ul className="list-group list-group-flush">
                            {
                                codeList.map((code, i) => {
                                    return <IdenticalCodeList key={i} row={i} code={code} handleOnClick={()=>handleUseIdentical(code)} handleOnClickDel={()=>{handleDeleteIdentical(i)}} />
                                })
                            }
                            <li className="list-group-item d-inline-flex justify-content-between create-number-format" onClick={handleShowFormIdentical}>
                                <span className="">Create New Identical</span>
                                <span className=""><i className="bi bi-caret-down-fill"></i></span>
                            </li>
                        </ul>
                    </div>
                    {showFormIdentic && <FormIdenticalCode data={[formIdentical, identicalAvailable, lastInitialDigit]} handleInput={handleInputIdentical} handleCreate={handleCreateIdentical} />}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalIdenticalCode