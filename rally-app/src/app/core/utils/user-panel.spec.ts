 // Ajusta la ruta según tu proyecto
import { ExternalUserDirectory } from '@models/users/Users';
import { UpdateUserPanel } from './user-panel';

describe('UpdateUserPanel', () => {
  it('debe retornar dos paneles cuando name está definido', () => {
    // Definimos un usuario con name, lastName y secondLastName
    const user: ExternalUserDirectory = {
      
      userName: "",
      accountNumber: "",
      name: "",
      lastName: "",
      secondLastName: "",
      birthDate: "",
      corporateEmail: "",
      chiefAccountNumber: "",
      hireDate: "",
      userTypeId: 1,
      status: 1
    };

    // Llamamos a la función
    const result = UpdateUserPanel(user);
    
    // Verificamos el resultado
    expect(result).toEqual(
      [
        {
          icon: 'person',
          label: "",
          text: 'Usuario de red'
        },
        {
          icon: 'badge',
          label: `${user.userName} ${user.lastName} ${user.secondLastName}`,
          text: 'Nombre de Usuario'
        } 
      ]
      );
  });

  it('debe retornar un solo panel cuando name no está definido', () => {
    // Definimos un usuario sin name
    const user: ExternalUserDirectory = {
      userName: "",
      accountNumber: "",
      name: "",
      lastName: "",
      secondLastName: "",
      birthDate: "",
      corporateEmail: "",
      chiefAccountNumber: "",
      hireDate: "",
      userTypeId: 1,
      status: 1
    };

    // Llamamos a la función
    const result = UpdateUserPanel(user);

    // Verificamos el resultado
    expect(result).toEqual(
      [
        {
          icon: 'person',
          label: "",
          text: 'Usuario de red'
        },
        {
          icon: 'badge',
          label: `${user.userName} ${user.lastName} ${user.secondLastName}`,
          text: 'Nombre de Usuario'
        } 
      ]
    );
  });

  it('debe retornar un solo panel cuando name es null', () => {
    // Definimos un usuario con name = null
    const user: ExternalUserDirectory = {
      userName: "",
      accountNumber: "",
      name: "",
      lastName: "",
      secondLastName: "",
      birthDate: "",
      corporateEmail: "",
      chiefAccountNumber: "",
      hireDate: "",
      userTypeId: 1,
      status: 1
    };

    // Llamamos a la función
    const result = UpdateUserPanel(user);

    // Verificamos el resultado
    expect(result).toEqual(
      [
        {
          icon: 'person',
          label: "",
          text: 'Usuario de red'
        },
        {
          icon: 'badge',
          label: `${user.userName} ${user.lastName} ${user.secondLastName}`,
          text: 'Nombre de Usuario'
        } 
      ]
    );
  });

  it('debe retornar un solo panel cuando name es una cadena vacía', () => {
    // Definimos un usuario con name = ''
    const user: ExternalUserDirectory = {
      userName: "",
      accountNumber: "",
      name: "",
      lastName: "",
      secondLastName: "",
      birthDate: "",
      corporateEmail: "",
      chiefAccountNumber: "",
      hireDate: "",
      userTypeId: 1,
      status: 1
    };

    // Llamamos a la función
    const result = UpdateUserPanel(user);

    // Verificamos el resultado
    expect(result).toEqual(
      [
        {
          icon: 'person',
          label: "",
          text: 'Usuario de red'
        },
        {
          icon: 'badge',
          label: `${user.userName} ${user.lastName} ${user.secondLastName}`,
          text: 'Nombre de Usuario'
        } 
      ]
    );
  });
});