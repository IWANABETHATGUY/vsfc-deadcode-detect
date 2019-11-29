
import {
  ObjectProperty,
  ObjectExpression,
  ObjectMethod,
  isSpreadElement,
  isIdentifier,
} from '@babel/types';

export function getObjectProperty(
  object: ObjectExpression,
  key: string
): ObjectProperty | ObjectMethod  | null {
  const properties = object.properties;
  for (let index = 0; index < properties.length; index++) {
    const property = properties[index];
    if (!isSpreadElement(property)) {
      if (isIdentifier(property.key) && property.key.name === key) {
        return property;
      }
    }
  }
  return null;
}

export function isTwoSortedArrayEqual(a: any[], b: any[]): void {
  expect(a.sort()).toEqual(b.sort());
}