import { Injectable } from '@angular/core';
import { DIALOG_RESPONSE_TYPE } from '@constants/DialogResponseType';
import Swal from 'sweetalert2';
@Injectable({
	providedIn: 'root'
})
export class SweetAlertService {
	title = 'Auditoría';
	primaryColor = '#b1005c';

	constructor() {
		// Todo
	}

	async showDeleteConfirmationAlert({
		title = '¡Confirmación de eliminación! ',
		text = '¿Eliminar Registro?'
	} = {}) {
		const result = await Swal.fire({
			title,
			text,
			icon: 'warning',
			showCloseButton: true,
			showCancelButton: true,
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Aceptar',
			confirmButtonColor: this.primaryColor,
			reverseButtons: true
		});

		return result.isConfirmed;
	}

	async showActionConfirmationAlert({
		title = '¡Confirmación! ',
		text = '¿Esta seguro que desea realizar esta acción?'
	} = {}) {
		const result = await Swal.fire({
			title,
			text,
			icon: 'question',
			showCloseButton: true,
			showCancelButton: true,
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Aceptar',
			confirmButtonColor: this.primaryColor,
			reverseButtons: true
		});

		return result.isConfirmed;
	}

	async showDoubleActionAlert({
		title = '¡Confirmación! ',
		text = '¿Esta seguro que desea realizar esta acción?',
		primaryButtonText = 'Ok',
		secondaryButtonText = 'Denegar'
	} = {}) {
		return Swal.fire({
			title,
			text,
			showDenyButton: true,
			showCancelButton: true,
			showCloseButton: true,
			confirmButtonText: primaryButtonText,
			confirmButtonColor: this.primaryColor,
			denyButtonColor: '#006990',
			denyButtonText: secondaryButtonText
		}).then((result) => {
			let response = DIALOG_RESPONSE_TYPE.primaryAction;
			if (result.isConfirmed) {
				response = DIALOG_RESPONSE_TYPE.primaryAction;
			} else if (result.isDenied) {
				response = DIALOG_RESPONSE_TYPE.secondaryAction;
			} else {
				response = DIALOG_RESPONSE_TYPE.cancelAction;
			}
			return new Promise((resolve) => resolve(response));
		});
	}
}
