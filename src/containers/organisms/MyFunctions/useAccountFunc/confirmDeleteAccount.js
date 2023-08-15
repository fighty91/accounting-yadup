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
        Swal.fire(
            'Failed!',
            `There is already transactions in ${account.accountName}`,
            'info'
        )
        childCount > 0 && 
        Swal.fire(
            'Failed!',
            `There is already Sub Account in ${account.accountName}`,
            'info'
        )
        masterAcc > 0 &&
        Swal.fire(
            'Failed!',
            `There has been a depreciation or amortization account`,
            'info'
        )
        contactCount > 0 && 
        Swal.fire(
            'Failed!',
            `This account is used for mapping on contact`,
            'info'
        )
    }
    return deleteApproval
}

export {confirmDeleteAccount}