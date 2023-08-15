import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkTo = (props) => {{
    return(
        <Link to={props.linkTo} className={`btn btn-${props.color} btn-sm`}>{props.name}</Link>
    )
}}

const ButtonDuplicate = (props) => {{
    return(
        <Link to={props.linkTo} className={`btn btn-${props.color} btn-sm`}>{props.name} <svg className="bi"><use xlinkHref="#check2-circle"/></svg>
        </Link>
    )
}}

const ButtonSubmit = (props) => {{
    const {color, handleOnClick, isUpdate} = props
    return(
        <button type="submit" className={`btn btn-${color} btn-sm`} onClick={handleOnClick}>{isUpdate ? 'Update' : 'Submit'}</button>
    )
}}

const ButtonDelete = (props) => {{
    return(
        <button type="submit" className={`btn btn-${props.color} btn-sm`} onClick={props.handleOnClick}>Delete</button>
    )
}}

export {ButtonLinkTo, ButtonDuplicate, ButtonSubmit, ButtonDelete}