import { MapperModel } from '@models/mapper/mapper';
export abstract class MapperService<T, S> implements MapperModel<T, S> {
	protected abstract mapTo(entity: S): T;
	protected abstract mapCreate(entity: T): S;

	private transformItem(entity: S): T {
		return this.mapTo(entity);
	}
	private transformItems(array: S[]): T[] {
		return array.map((item: S) => this.mapTo(item));
	}

	transform(entityOrArray: S | S[]): T | T[] {
		return Array.isArray(entityOrArray)
			? this.transformItems(entityOrArray)
			: this.transformItem(entityOrArray);
	}
	private transformCreateItem(entity: T): S {
		return this.mapCreate(entity);
	}
	private transformCreatesItems(entity: T[]): S[] {
		return entity.map((item: T) => this.mapCreate(item));
	}
	transformCreate(entityOrArray: T | T[]): S | S[] {
		return Array.isArray(entityOrArray)
			? this.transformCreatesItems(entityOrArray)
			: this.transformCreateItem(entityOrArray);
	}
}
