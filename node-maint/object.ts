import _ from 'lodash';

export function deepMerge(objValue, srcValue) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    const maxLength = Math.max(objValue.length, srcValue.length);
    return Array.from({ length: maxLength }, (__, i) => {
      const val1 = objValue[i];
      const val2 = srcValue[i];

      if (_.isPlainObject(val1) && _.isPlainObject(val2)) {
        return _.mergeWith({}, val1, val2, deepMerge);
      } else if (Array.isArray(val1) && Array.isArray(val2)) {
        return deepMerge(val1, val2);
      } else {
        return val2 !== undefined ? val2 : val1;
      }
    });
  }

  if (Array.isArray(srcValue)) {
    return deepMerge([], srcValue);
  }

  if (_.isPlainObject(srcValue)) {
    return _.mergeWith({}, objValue || {}, srcValue, deepMerge);
  }

  return undefined;
}

function deepPick(input: any, path: string): any {
  if (path.includes('[].')) {
    const occurrences = (path.match(/\[\]\./g) || []).length;
    if (occurrences !== 1) {
      throw new Error('Multiple [] is not supported!');
    }

    const [head, tail] = path.split('[].');
    const array = _.get(input, head) ?? [];
    return array.reduce((result: any[], item: any) => {
      if (item?.Status !== 'Archived') {
        const value = tail ? _.get(item, tail) : _.get(input, head);
        result.push(value ?? undefined);
      }
      return result;
    }, []);
  }
  return _.get(input, path);
}

export function addToList(list: any[], item: any): any[] {
  const index = list.findIndex((listItem) => listItem.id === item.id);
  if (index !== -1) {
    Object.assign(list[index], item);
  } else {
    list.push(item);
  }
  return list;
}

export function set(model: any, path: string, values: any): any {
  if (!_.isObject(model)) {
    console.error('Not an object', model, path, values);
    throw new Error('Not an object');
  }

  if (path.includes('[]') || (Array.isArray(values) && typeof values[0] === 'object')) {
    const [head, tail] = path.split('[].');
    const headInstance = _.get(model, head) ?? [];

    _.set(model, head, headInstance);

    if (Array.isArray(values)) {
      values.forEach((value) => {
        if (value.__removed) {
          const headItem = headInstance.find((item) => _.get(item, tail)?.id === value.id);
          if (headItem) {
            headItem.status = 'Archived';
            delete value.__removed;
          }
        } else {
          const tailInstance = headInstance.find((item) => _.get(item, tail)?.id === value.id) || {};
          set(tailInstance, tail, value);
          if (!_.get(tailInstance, tail)) {
            headInstance.push(tailInstance);
          }
        }
      });
    } else {
      throw new Error('Not supported yet');
    }
  } else {
    _.set(model, path, values);
  }

  return model;
}

export function differenceObjectDeep(A: any, B: any): any {
  if (A === B || _.isEqual(A, B)) {
    return Array.isArray(A) ? [] : _.isObject(A) ? {} : undefined;
  }

  if (_.isObject(A) && !_.isObject(B)) {
    return B;
  }

  return _.reduce(
    A,
    (result: any, value: any, key: any) => {
      if (_.isObject(value) && _.isObject(B[key])) {
        if (!_.isMatch(value, B[key])) {
          result[key] = differenceObjectDeep(value, B[key]);
        }
      } else if (value !== B[key] && !_.isEqual(value, B[key])) {
        result[key] = B[key];
      }
      return result;
    },
    _.omit(B, _.keys(A))
  );
}

export function flattenKeys(object: any, initialPathPrefix = ''): any {
  if (!object || typeof object !== 'object' || (Array.isArray(object) && object.length === 0)) {
    return [{ [initialPathPrefix]: object }];
  }

  const prefix = initialPathPrefix ? (Array.isArray(object) ? initialPathPrefix : `${initialPathPrefix}.`) : '';

  return Object.keys(object)
    .flatMap((key) => flattenKeys(object[key], Array.isArray(object) ? `${prefix}[${key}]` : `${prefix}${key}`))
    .reduce((acc, path) => ({ ...acc, ...path }), {});
}

export function removeItemFromList(list: any[], item: any): void {
  const index = list.findIndex((listItem) => listItem.id === item.id);
  if (index !== -1) list.splice(index, 1);
}

export function isSubset(superObj: any, subObj: any): boolean {
  if (!subObj || typeof subObj !== 'object' || Array.isArray(subObj)) {
    return subObj === superObj;
  }

  return Object.keys(subObj).every((key) => isSubset(superObj[key], subObj[key]));
}

interface Component {
  key?: string;
  components?: Component[];
}

export function getComponentsByKey(data: Component[]): { [key: string]: Component } {
  const components: { [key: string]: Component } = {};

  const traverse = (comps: Component[]) => {
    comps.forEach((c) => {
      if (c.key) {
        components[c.key] = c;
      }
      if (c.components && c.components.length > 0) {
        traverse(c.components);
      }
    });
  };

  traverse(data);
  return components;
}

export function get(model: { [k: string]: any }, path: string, defaultValue?: any): any {
  if (!_.isObject(model)) {
    console.error('Not an object', model, path, defaultValue);
    return defaultValue;
  }
  return deepPick(model, path) ?? defaultValue;
}

function stringifyFilter(item) {
  let i = 0;

  return function (key, value) {
    if (i !== 0 && typeof item === 'object' && typeof value == 'object' && item == value) return '[Circular]';

    if (i >= 29) return '[Unknown]';

    ++i;

    return value;
  };
}

export function stringify(item, censor = null, space = 2) {
  return JSON.stringify(item, censor ? censor : stringifyFilter(item), space);
}

export function clean(item) {
  return JSON.parse(stringify(item));
}
