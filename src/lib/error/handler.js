/* eslint-disable */
export const networkErrorHandler = error => {
  if (error['code'] !== undefined && error['reason'] !== undefined) {
    return `code: ${error.code}, message: ${error.reason}`;
  }
  return `code: UNKNOWN_ERROR, message: ${error}`;
};
