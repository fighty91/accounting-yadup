import React, { useEffect } from "react";
import IdenticalCodeList from "./IdenticalCodeList";
import FormIdenticalCode from "./FormIdenticalCode";
import { chooseIdentical, deleteIdentical, getIdenticalCodeFromAPI, putIdenticalCodeToAPI } from "../../../config/redux/action";
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
                title: `Identical Code ${initialCode}[auto]`
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
        lastInitialDigit && problemCount++
        lastInitialSpace && problemCount++
        firstInitialSpace && problemCount++
        !formIdentical.initialCode && problemCount++
        !identicalAvailable && problemCount++
        
        if(problemCount === 0) {
            let newCodeList = [...identicalCode.codeList]
            let newFormIdentical = {...formIdentical}
            if(newFormIdentical.startFrom === '' || newFormIdentical.startFrom === 0) newFormIdentical.startFrom = 1
            newCodeList.push(newFormIdentical)
            newCodeList.sort((a, b) => 
                a.transNumber < b.transNumber ? -1 :
                a.transNumber > b.transNumber ? 1 : 0
            )
            const newIdenticalCode = {
                ...identicalCode,
                codeList: newCodeList
            }
            const res = await props.putIdenticalCodeToAPI(newIdenticalCode)
            res && getResetFormIdentical()
        }
    }

    const handleShowFormIdentical = () => {
        setShowForm(showFormIdentic ? false : true)
    }

    const handleInputIdentical = (data) => {
        setAvailable(true)
        let lastDigit = false
        let lastSpace = false
        let firstSpace = false

        let newFormIdentical = {...formIdentical}
        let {name, value} = data.target
        if (name === 'startFrom') {
            const startNumb = +value
            if(startNumb % 1 === 0) newFormIdentical[name] = startNumb
        } else {
            newFormIdentical[name] = value
            if(value.length > 0 && value.charAt(0) === ' ') {
                firstSpace = true
            } else if(value.length > 1) {
                const lastChar = value.charAt(value.length-1)
                if(lastChar === ' ') {
                    lastSpace = true
                } else {
                    if (value !== '' && +lastChar >= 0) lastDigit = true 
                }
            }
        }
        setLastInitialDigit(lastDigit)
        setLastInitialSpace(lastSpace)
        setFirstInitialSpace(firstSpace)
        setFormIdentical(newFormIdentical)

        let newCodeList = [...identicalCode.codeList]
        const {initialCode} = newFormIdentical
        const notAvailable = newCodeList.find(e => initialCode && initialCode === e.initialCode)
        notAvailable && setAvailable(false)
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
        setLastInitialDigit,
        setLastInitialSpace,
        setFirstInitialSpace,
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
    putIdenticalCodeToAPI: (data) => dispatch(putIdenticalCodeToAPI(data))
})

export default connect(reduxState, reduxDispatch)(ModalIdenticalCode)