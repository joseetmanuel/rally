import { QueryStringBuilder } from './query-string-builder';

describe('QueryStringBuilder', () => {
  it('should return empty URLSearchParams if input object is null', () => {
    const result = QueryStringBuilder.BuildParametersFromSearch(null);
    expect(result.toString()).toBe('');
  });

  it('should build query string for a flat object', () => {
    const input = { name: 'John', age: 30, city: 'New York' };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe('name=John&age=30&city=New+York');
  });

  it('should build query string for nested objects', () => {
    const input = {
      user: {
        name: 'John',
        details: {
          age: 30,
          city: 'New York',
        },
      },
    };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe(
      'user.name=John&user.details.age=30&user.details.city=New+York',
    );
  });

  it('should build query string for arrays', () => {
    const input = { ids: [1, 2, 3] };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe('ids%5B0%5D=1&ids%5B1%5D=2&ids%5B2%5D=3');
  });

  it('should build query string for dates', () => {
    const input = { createdAt: new Date('2023-01-01T12:00:00Z') };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe('createdAt=2023-01-01T12%3A00%3A00.000Z');
  });

  it('should handle mixed object types (arrays, dates, and primitives)', () => {
    const input = {
      name: 'John',
      tags: ['developer', 'typescript'],
      createdAt: new Date('2023-01-01T12:00:00Z'),
      details: {
        city: 'New York',
        zip: 12345,
      },
    };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe(
      'name=John&tags%5B0%5D=developer&tags%5B1%5D=typescript&createdAt=2023-01-01T12%3A00%3A00.000Z&details.city=New+York&details.zip=12345',
    );
  });

  it('should handle empty arrays', () => {
    const input = { ids: [] };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe('');
  });

  it('should handle empty nested objects', () => {
    const input = { user: {} };
    const result = QueryStringBuilder.BuildParametersFromSearch(input);

    expect(result.toString()).toBe('');
  });
});
