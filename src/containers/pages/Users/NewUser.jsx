import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import { ButtonLinkTo } from "../../../components/atoms/ButtonAndLink";
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { getUserAccessFromAPI, registerUserAPI } from "../../../config/redux/action";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import InputValidation from "../../../components/atoms/InputValidation";

const NewUser = (props) => {
    const [userAccess, setUserAccess] = useState([])
    const navigate = useNavigate()
    const [user, setUser] = useState({name: '', email: '', password: '', confirmPassword: '', userAccessId: 2})
    const [passwordValid, setPasswordValid] = useState(true)
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
    
    const handleOnchange = (event) => {
        const { name, value } = event.target
        let newUser = {...user}
        name === 'userAccessId' ?
        newUser[name] = +value :
        newUser[name] = value
        setUser(newUser)
    }

    const handleEnterKey = (event) => {
        event.key === 'Enter' && handleSubmit()
    }

    const handleSubmit = async() => {
        let newUserNull = false
        for( let x in user ) {
            if (!user[x]) newUserNull = true
        }
        if(newUserNull) {
            Swal.fire(
                'Input Empty!',
                'There is an empty part of your input',
                'info'
            )
        } else {
            if( user.password === user.confirmPassword ) {
                const res = await props.registerAPI(user)
                if(res) {
                    Toast.fire({
                        icon: 'success',
                        title: `Success Register \n${user.name}`
                    })
                    navigate('/users')
                } else {
                    Swal.fire(
                        'Failed!',
                        `Failed Register ${user.name}`,
                        'info'
                    )
                }
            } else {
                setPasswordValid(false)
            }
        }
    }
    
    useEffect(() => {
        props.getUserAccessFromAPI()
    }, [])

    useEffect(() => {
        let temp = []
        for( let i = 1; i < props.userAccess.length; i++) {
            temp.push(props.userAccess[i])
        }
        setUserAccess(temp)
    }, [props.userAccess])
    
    return(
        <LayoutsMainContent>
            <ContentHeader name="New User"/>
            {/* Entry Content */}
            <div className="card pb-5">
                <div className="card-header">
                    Entry new user
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="userAccessId" className="form-label">User Access</label>
                            <select className="form-select form-select-sm" id="userAccessId" name="userAccessId" value={user.userAccessId} onChange={handleOnchange} >
                                {
                                    userAccess.map((access, i) => {
                                        return <option key={i} value={access.id}>{access.name}</option>
                                    })
                                }
                            </select>
                        </div>
                        
                    </div>
                    <div className="row g-3 mb-5">
                        <div className="col-md-6">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" className="form-control form-control-sm" id="name" name="name" onChange={handleOnchange} value={user.name} autoComplete="off" onKeyUp={handleEnterKey}/>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" className="form-control form-control-sm" id="email" name="email" onChange={handleOnchange} value={user.email} onKeyUp={handleEnterKey} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="form-control form-control-sm" id="password" name="password" onChange={handleOnchange} value={user.password} onKeyUp={handleEnterKey} />
                            { !passwordValid && <InputValidation name="password unmatch!!" /> }
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <input type="password" className="form-control form-control-sm" id="confirmPassword" name="confirmPassword" onChange={handleOnchange} value={user.confirmPassword} onKeyUp={handleEnterKey} />
                            { !passwordValid && <InputValidation name="password unmatch!!" /> }
                        </div>
                    </div>
                    {
                        props.authLoading ?
                        <button className="btn btn-outline-primary btn-sm" disabled>Loading...</button>
                        :
                        <button type="submit" className="btn btn-outline-primary btn-sm"  onClick={handleSubmit}>Submit</button>
                    }
                    &nbsp;&nbsp;&nbsp;
                    <ButtonLinkTo name="Cancel" linkTo="/users" color="outline-danger"/>
                </div>
            </div>
        </LayoutsMainContent>
    )
}

const reduxState = (state) => ({
    authLoading: state.authLoading,
    userAccess: state.userAccess
})
const reduxDispatch = (dispatch) => ({
    getUserAccessFromAPI: () => dispatch(getUserAccessFromAPI()),
    registerAPI: (data) => dispatch(registerUserAPI(data))
})

export default connect(reduxState, reduxDispatch)(NewUser)