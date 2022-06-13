/* eslint-disable */
export const isBoolean = val =>
  typeof val === 'boolean' ||
  (typeof val === 'object' && val !== null && typeof val.valueOf() === 'boolean');

export const isValidString = variable =>
  variable !== undefined && variable !== null && variable !== '' && typeof variable === 'string';
