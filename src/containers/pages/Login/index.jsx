import React, { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { loginUserAPI } from "../../../config/redux/action";
import Swal from "sweetalert2";
import { getCorpNameShow } from "../../organisms/MyFunctions/useGeneralFunc";
import './Login.scss'

const Login = (props) => {
    const navigate = useNavigate()
    const [user, setUser] = useState({email: '', password: ''})

    const handleOnchange = (event) => {
        const {name, value} = event.target
        let newUser = {...user}
        newUser[name] = value
        setUser(newUser)
    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1700,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    const handleSubmit = async () => {
        const {email, password} = user
        const res = await props.loginUserAPI({email, password})
        if(res) {
            Toast.fire({
                icon: 'success',
                title: 'Login successfully'
            })
            navigate('/')
        } else {
            Toast.fire({
                icon: 'error',
                title: 'Login Failed'
            })
        }
    }
    const handleEnterKey = (e) => {
        e.key === 'Enter' && handleSubmit()
    }

    useEffect(() => {
        document.title = `${getCorpNameShow()} Accounting - Login`
    }, [])

    return (
        <Fragment>
            <svg xmlns="http://www.w3.org/2000/svg" style={{display: "none"}}>
                <symbol id="check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </symbol>
                <symbol id="circle-half" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/>
                </symbol>
                <symbol id="moon-stars-fill" viewBox="0 0 16 16">
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                    <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/>
                </symbol>
                <symbol id="sun-fill" viewBox="0 0 16 16">
                    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </symbol>
            </svg>

            <main className="form-signin w-100 m-auto py-5 my-5">
                {/* <img className="mb-4" src="../assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" /> */}
                <h1 className="h3 mb-3 fw-normal">Please Login</h1>

                <div className="form-floating">
                    <input type="email" className="form-control log-email" id="email" name="email" placeholder="name@example.com" onChange={handleOnchange} value={user.email} onKeyUp={handleEnterKey} />
                    <label htmlFor="email">Email address</label>
                </div>
                <div className="form-floating mb-5">
                    <input type="password" className="form-control log-password" id="password" name="password" placeholder="Password" onChange={handleOnchange} value={user.password} onKeyUp={handleEnterKey} />
                    <label htmlFor="password" >Password</label>
                </div>

                {/* <div className="form-check text-start my-3"> */}
                    {/* <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Remember me
                    </label> */}
                {/* </div> */}
                {
                    props.authLoading ?
                    <button className="btn btn-primary w-100 py-2" disabled>Loading...</button> :
                    <button className="btn btn-primary w-100 py-2" onClick={handleSubmit}>Login</button>
                }
                <Link to='/forgot-password' className="btn btn-outline-secondary w-100 py-2 mt-3">Forgot Password?</Link>
                <p className="mt-5 mb-3 text-body-secondary">&copy; 2023 - AccSo</p>
            </main>
        </Fragment>
    )
}

const reduxState = (state) => ({
    authLoading: state.authLoading
})

const reduxDispatch = (dispatch) => ({
    loginUserAPI: (data) => dispatch(loginUserAPI(data))
})
export default connect(reduxState, reduxDispatch)(Login)