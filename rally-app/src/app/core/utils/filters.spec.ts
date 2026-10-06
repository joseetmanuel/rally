 // Ajusta la ruta según tu proyecto
import { Section } from '@models/section/Section';
import { MenuFilter } from './filters';

describe('MenuFilter', () => {
  let menuFilter: MenuFilter;

  beforeEach(() => {
    menuFilter = new MenuFilter(); // Inicializa el servicio antes de cada prueba
  });

  it('debe filtrar correctamente un array sin hijos', () => {
    const data: Section[] = [
      {
        systemId: 1,
        name: "",
        route: "",
        order: 1,
        inMenu: 1,
        typeSectionId: 1,
        status: true
      }
    ];

    const result = menuFilter.filterItems(data);

    expect(result).toEqual([
      {
        systemId: 1,
        name: "",
        route: "",
        order: 1,
        inMenu: 1,
        typeSectionId: 1,
        status: true
      }
    ]);
  });

  it('debe filtrar correctamente un array con hijos', () => {
    const data: Section[] = [
      {
        systemId: 1,
        name: "",
        route: "",
        order: 1,
        inMenu: 1,
        typeSectionId: 1,
        status: true
      },
      
    ];

    const result = menuFilter.filterItems(data);

    expect(result).toEqual([
      {
        systemId: 1,
        name: "",
        route: "",
        order: 1,
        inMenu: 1,
        typeSectionId: 1,
        status: true
      }
    ]);
  });

  it('debe retornar un array vacío si ningún elemento cumple con inMenu == 1', () => {
    const data: Section[] = [
     
     
    ];

    const result = menuFilter.filterItems(data);

    expect(result).toEqual([]);
  });

  it('debe retornar un array vacío si el array de entrada está vacío', () => {
    const data: Section[] = [];

    const result = menuFilter.filterItems(data);

    expect(result).toEqual([]);
  });

});