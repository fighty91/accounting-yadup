import React, { useState } from "react";
import './IdenticalCodeList.css'

const IdenticalCodeList = (props) => {
    const [spinner, setSpinner] = useState(false)

    const callSpinner = () => {
        setSpinner(true)
        setTimeout(()=> {
            props.handleOnClickDel()
            setSpinner(false)
        }, 300)
    }
    const {initialCode} = props.code
    return(
        <li key={props.row} className="list-group-item d-inline-flex justify-content-between">
            <span className="identical-code-ready" onClick={()=>props.handleOnClick()} data-bs-dismiss="modal">
                {initialCode && initialCode + '.'}[auto]
            </span>
            {   
                !initialCode ?
                <span className="text-secondary" >
                    <i className="bi bi-trash3-fill"></i>
                </span>
                :
                spinner ?
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div> 
                :
                <span className="text-primary delete-identical-code" onClick={callSpinner}>
                    <i className="bi bi-trash3-fill"></i>
                </span>
            }
        </li>
    )
}

export default IdenticalCodeList