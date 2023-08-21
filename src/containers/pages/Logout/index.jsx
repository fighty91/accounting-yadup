import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUserAPI } from "../../../config/redux/action";
import { corporation } from "../../../config/corporation";

const Logout = (props)  => {
    const navigate = useNavigate()
    useEffect(() => {
        navigate('/login')
        localStorage.removeItem(`${corporation.name}uid`)
        localStorage.removeItem(`token_${corporation.name}uid`)
        props.getLogoutAPI()
    }, [])
    return (
        <Fragment></Fragment>
    )
}

const reduxState = (state) => ({
    isLogin: state.isLogin
})
const reduxDispath = (dispatch) => ({
  getLogoutAPI: () => dispatch(logoutUserAPI())
})

export default connect(reduxState, reduxDispath)(Logout)

  