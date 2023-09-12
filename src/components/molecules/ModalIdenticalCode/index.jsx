import React, { useEffect } from "react";
import IdenticalCodeList from "./IdenticalCodeList";
import FormIdenticalCode from "./FormIdenticalCode";
import { chooseIdentical, deleteIdentical, getIdenticalCodeFromAPI, postIdenticalCodeToAPI } from "../../../config/redux/action";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import './ModalIdenticalCode.scss'

const ModalIdenticalCode = (props) => {
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

    const handleUseIdentical = async (data) => {
        const {codeFor} = identicalCode,
        {initialCode} = data
        const res = await props.chooseIdentical({initialCode, codeFor})
        if(res) {
            Toast.fire({
                icon: 'success',
                title: `Identical Code ${initialCode && initialCode + '.'}[auto]`
            })
        }
    }

    const handleDeleteIdentical = async(data) => {
        const {codeFor} = identicalCode,
        {initialCode} = data
        const res = await props.deleteIdentical({initialCode, codeFor})
        if(res) {
            Toast.fire({
                icon: 'success',
                title: `Identical Code ${initialCode}[auto]`
            })
        }
    }

    const handleCreateIdentical = async () => {
        let problemCount = 0
        !formIdentical.initialCode && problemCount++
        !identicalAvailable && problemCount++
        
        if(problemCount === 0) {
            const {codeFor} = identicalCode,
            {initialCode} = formIdentical
            let newIdentical = {
                ...formIdentical,
                isActive: true, lastOrder: 0
            }
            delete newIdentical.initialCode
            if(newIdentical.startFrom === '') newIdentical.startFrom = 1
            const res = await props.postIdenticalCodeToAPI({initialCode, codeFor, newIdentical})
            res && getResetFormIdentical()
        }
    }

    const handleShowFormIdentical = () => {
        setShowForm(showFormIdentic ? false : true)
    }

    const handleInputIdentical = (data) => {
        setAvailable(true)
        let {name, value} = data.target,
        newFormIdentical = {...formIdentical}
        if(value >= 0) {
            value !== '' ? 
            value % 1 === 0 && (newFormIdentical[name] = +value) :
            newFormIdentical[name] = value
           
            setFormIdentical(newFormIdentical)
            
            let newCodeList = [...identicalCode.codeList]
            const {initialCode} = newFormIdentical
            const notAvailable = newCodeList.find(e => initialCode && +initialCode === +e.initialCode)
            notAvailable && setAvailable(false)
        }
    }

    useEffect(()=> {
        const temp = props.identicalCode[identicalCode.codeFor]
        !temp && props.getIdenticalCodeFromAPI()
    }, [])
    useEffect(()=> {
        const temp = props.identicalCode[identicalCode.codeFor]
        temp && setIdentical(temp)
    }, [props.identicalCode])

    const {identicalCode,
        showFormIdentic,
        formIdentical,
        identicalAvailable,
        lastInitialDigit,
        lastInitialSpace,
        firstInitialSpace
    } = props.data

    const {
        setIdentical,
        setAvailable,
        setShowForm,
        // setLastInitialDigit,
        // setLastInitialSpace,
        // setFirstInitialSpace,
        setFormIdentical,
        getResetFormIdentical
    } = props.identicalState

    return (
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="identicalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content modal-identical-code">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="identicalLabel">Identical Code</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-inline-flex justify-content-between create-number-format" onClick={handleShowFormIdentical}>
                                <span className="">Create New Identical</span>
                                <span className=""><i className="bi bi-caret-down-fill"></i></span>
                            </li>
                            {showFormIdentic && <FormIdenticalCode data={[formIdentical, identicalAvailable, lastInitialDigit, lastInitialSpace, firstInitialSpace]} handleInput={handleInputIdentical} handleCreate={handleCreateIdentical} />}
                            {
                                identicalCode.codeList.map((code, i) => {
                                    return <IdenticalCodeList key={i} row={i} code={code} handleOnClick={()=>handleUseIdentical(code)} handleOnClickDel={()=>{handleDeleteIdentical(code)}} />
                                })
                            }
                        </ul>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>

                </div>
            </div>
        </div>
    )
}

const reduxState = (state) => ({
    identicalCode: state.identicalCode
})
const reduxDispatch = (dispatch) => ({
    chooseIdentical: (data) => dispatch(chooseIdentical(data)),
    deleteIdentical: (data) => dispatch(deleteIdentical(data)),
    getIdenticalCodeFromAPI: () => dispatch(getIdenticalCodeFromAPI()),
    postIdenticalCodeToAPI: (data) => dispatch(postIdenticalCodeToAPI(data))
})

export default connect(reduxState, reduxDispatch)(ModalIdenticalCode)