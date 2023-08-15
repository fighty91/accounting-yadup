import React from "react";
import './InputValidation.css'

const InputValidation = (props) => {
    return (
        <div className="text-danger mt-0 mb-0 not-valid">{props.name}</div>
    )
}

export default InputValidation