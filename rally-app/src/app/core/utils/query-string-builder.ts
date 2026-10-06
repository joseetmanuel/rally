export class QueryStringBuilder {
	static BuildParametersFromSearch<T>(obj: T): URLSearchParams {
		const params: URLSearchParams = new URLSearchParams();
		if (obj == null) {
			return params;
		}
		QueryStringBuilder.PopulateSearchParams(params, '', obj);
		return params;
	}

	private static PopulateArray<T>(
		params: URLSearchParams,
		prefix: string,
		val: Array<T>
	) {
		for (const index of Object.keys(val)) {
			const _index = Number(index);
			const key = `${prefix}[${_index}]`;
			const value: any = val[Number(_index)];
			QueryStringBuilder.PopulateSearchParams(params, key, value);
		}
	}

	private static PopulateObject<T>(
		params: URLSearchParams,
		prefix: string,
		val: T
	) {
		const obj = Object(val);
		const objectKeys = Object.keys(obj) as Array<keyof T>;
		if (prefix) prefix = `${prefix}.`;

		for (const objKey of objectKeys) {
			const value = val[objKey] || '';
			const key = prefix + objKey.toString();

			QueryStringBuilder.PopulateSearchParams(params, key, value);
		}
	}

	private static PopulateSearchParams(
		params: URLSearchParams,
		key: string,
		value: any
	) {
		if (value instanceof Array) {
			QueryStringBuilder.PopulateArray(params, key, value);
		} else if (value instanceof Date) {
			params.set(key, value.toISOString());
		} else if (value instanceof Object) {
			QueryStringBuilder.PopulateObject(params, key, value);
		} else {
			params.set(key, value ? value.toString() : '');
		}
	}
}
