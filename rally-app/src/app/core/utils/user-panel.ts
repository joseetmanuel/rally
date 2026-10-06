import { ExternalUserDirectory } from '@models/users/Users';

export function UpdateUserPanel(user: ExternalUserDirectory) {
	let panels: any;
	const { userName, name, lastName, secondLastName } = user;
	if (name != undefined) {
		panels = [
			{
				icon: 'person',
				label: userName,
				text: 'Usuario de red'
			},
			{
				icon: 'badge',
				label: `${name} ${lastName} ${secondLastName}`,
				text: 'Nombre de Usuario'
			}
		];
	} else {
		panels = [
			{
				icon: 'person',
				label: userName,
				text: 'Usuario de red'
			}
		];
	}

	return panels;
}
