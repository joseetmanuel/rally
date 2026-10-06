import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable()
export class MatPaginatorIntlSpanish extends MatPaginatorIntl {
	override itemsPerPageLabel = 'Registros por pagina';
	override nextPageLabel = 'Página siguiente';
	override lastPageLabel = 'Última página';
	override previousPageLabel = 'Página anterior';
	override firstPageLabel = 'Primer página';

	override getRangeLabel = function (
		page: number,
		pageSize: number,
		length: number
	) {
		if (length === 0 || pageSize === 0) {
			return '0 de ' + length + ' registros';
		}

		length = Math.max(length, 0);
		const startIndex = page * pageSize;
		const endIndex =
			startIndex < length
				? Math.min(startIndex + pageSize, length)
				: startIndex + pageSize;
		return startIndex + 1 + ' al ' + endIndex + ' de ' + length + ' registros';
	};
}
