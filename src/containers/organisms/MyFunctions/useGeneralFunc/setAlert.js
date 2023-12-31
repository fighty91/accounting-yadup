import Swal from "sweetalert2";

export const lostConnection = () => Swal.fire({
    title: 'Offline!',
    text: 'Sorry, your internet connection is lost!!',
    icon: 'warning',
    confirmButtonColor: '#fd7e14'
})

export const ToastAlert = Swal.mixin({
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