import {
  ObjectProperty,
  ObjectExpression,
  ObjectMethod,
  SpreadElement,
  isSpreadElement,
  isIdentifier,
} from '@babel/types';

export function getObjectProperty(
  object: ObjectExpression,
  key: string
): ObjectProperty | ObjectMethod | SpreadElement | null {
  const properties = object.properties;
  for (let index = 0; index < properties.length; index++) {
    const property = properties[index];
    if (isSpreadElement(property)) {
      if (isIdentifier(property.argument) && property.argument.name === key) {
        return property;
      }
    } else {
      if (isIdentifier(property.key) && property.key.name === key) {
        return property;
      }
    }
  }
  return null;
}
