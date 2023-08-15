import React, { Children, Fragment, useEffect } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { getCheckToken } from "../../../../config/redux/action";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import './LayoutMainContent.css'

const LayoutsMainContent = (props) => {
    const userId = JSON.parse(localStorage.getItem(`${props.corp}uid`))
    const accessToken = JSON.parse(localStorage.getItem(`token_${props.corp}uid`))
    const navigate = useNavigate()

    const checkAccessToken = async () => {
        const tokenMatch = await props.getCheckToken({accessToken, userId})
        !tokenMatch && navigate('/logout')
        console.log('tokeMatch', tokenMatch)
    }

    useEffect(() => {
        if (!props.isLogin) {
            checkAccessToken()
        }
        console.log('isLogin', props.isLogin)
    }, [])

    return (
        accessToken &&
        <Fragment>
            <div style={{height: "100vh"}}>
                <Navbar/>
                <div className="container-fluid">
                    <div className="row parent-scroll-area" >
                        <Sidebar />
                            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 scroll-area" style={{height: "100%"}}>
                                {
                                    Children.map(props.children, (child, i) => child)
                                }
                            </main>
                    </div>
                </div>
            </div>
        </Fragment> 
    )
}

const reduxState = (state) => ({
    isLogin: state.isLogin,
    corp: state.corp
})
const reduxDispatch = (dispatch) => ({
    getCheckToken: (data) => dispatch(getCheckToken(data))
})

export default connect(reduxState,reduxDispatch)(LayoutsMainContent)