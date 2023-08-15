import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUserAPI } from "../../config/redux/action";

const Logout = (props)  => {
    const navigate = useNavigate()
    const handleLogout = () => {
        navigate('/login')
        localStorage.removeItem(`${props.corp}uid`)
        localStorage.removeItem(`token_${props.corp}uid`)
        props.getLogoutAPI()
    }
    useEffect(() => {
        handleLogout()
    }, [])
    return (
        <Fragment></Fragment>
    )
}

const reduxState = (state) => ({
    corp: state.corp,
    isLogin: state.isLogin
})

const reduxDispath = (dispatch) => ({
  getLogoutAPI: () => dispatch(logoutUserAPI())
})

export default connect(reduxState, reduxDispath)(Logout)

  