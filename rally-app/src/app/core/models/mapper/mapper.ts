export interface MapperModel<S, T> {
	transform(entityOrArray: T | T[]): S | S[];
}
