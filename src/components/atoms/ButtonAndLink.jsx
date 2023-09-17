import React from "react";
import { Link } from "react-router-dom";

export const ButtonNavigate = (props) => (
    <button className={`btn btn-${props.color} btn-sm`} onClick={props.handleOnClick}>{props.name}</button>
)

export const ButtonLinkTo = (props) => (
    <Link to={props.linkTo} className={`btn btn-${props.color} btn-sm`}>{props.name}</Link>
)

export const ButtonDuplicate = (props) => (
    <Link to={props.linkTo} className={`btn btn-${props.color} btn-sm`}>{props.name} <svg className="bi">
        <use xlinkHref="#check2-circle"/></svg>
    </Link>
)

export const ButtonSubmit = (props) => {
    const {color, handleOnClick, name, isUpdate } = props
    return(
        <button type="submit" className={`btn btn-${color} btn-sm`} onClick={handleOnClick}>
            {name || (isUpdate ? 'Update' : 'Submit')}
        </button>
    )
}

export const ButtonDelete = (props) => (
    <button type="submit" className={`btn btn-${props.color} btn-sm`} onClick={props.handleOnClick}>Delete</button>
)