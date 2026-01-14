import Swal, { SweetAlertResult } from 'sweetalert2';

export const AlertNotification = (
    title: string,
    text: string,
    icon: "success" | "error" | "warning" | "info" | "question",
    timer: number,
    confirm: boolean,
) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        timer: timer,
        showConfirmButton: confirm,
    });
}

export const AlertQuestion = (
    title: string,
    text: string,
    icon: "success" | "error" | "warning" | "info" | "question",
    confirmButtonText: string,
    cancelButtonText: string,
): Promise<SweetAlertResult<any>> => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#2F2F30",
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true
    });
}