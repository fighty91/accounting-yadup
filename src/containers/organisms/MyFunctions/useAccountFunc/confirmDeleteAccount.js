import { checkAccHistory } from "./checkAccHistory"
import Swal from "sweetalert2"

const confirmDeleteAccount = async (data) => {
    const { account } = data
    // const { id } = account
    const { transCount, childCount, masterAcc, contactCount } = await checkAccHistory(data)
    let deleteApproval = false
    if (transCount < 1 && childCount < 1 && masterAcc < 1 && contactCount < 1) {
        deleteApproval = true
    } else {
        transCount > 0 && 
        Swal.fire({
            title: 'Failed!',
            text: `There is already transactions in ${account.accountName}`,
            icon: 'error',
            confirmButtonText: 'Close',
            confirmButtonColor: '#dc3545'
        })
        childCount > 0 && 
        Swal.fire({
            title: 'Failed!',
            text: `There is already Sub Account in ${account.accountName}`,
            icon: 'error',
            confirmButtonText: 'Close',
            confirmButtonColor: '#dc3545'
        })
        masterAcc > 0 &&
        Swal.fire({
            title: 'Failed!',
            text: `There has been a depreciation or amortization account`,
            icon: 'error',
            confirmButtonText: 'Close',
            confirmButtonColor: '#dc3545'
        })
        contactCount > 0 && 
        Swal.fire({
            title: 'Failed!',
            text: `This account is used for mapping on contact`,
            icon: 'error',
            confirmButtonText: 'Close',
            confirmButtonColor: '#dc3545'
        })
    }
    return deleteApproval
}

export {confirmDeleteAccount}