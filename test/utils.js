export const wait = async (
  // eslint-disable-next-line no-unused-vars
  fn,
  timeout = 30000,
  delay = 200,
  condition = '',
) => {
  const startTime = Number(new Date());
  const endTime = startTime + timeout;

  const test = (resolve, reject) => {
    const result = fn();

    result
      .then(res => {
        if (res) {
          // eslint-disable-next-line no-console
          // console.log(
          //   `SUCCESS: condition met after ${Number(new Date()) - startTime} ms! ${condition}`,
          // )
          resolve(res);
        } else if (Number(new Date()) < endTime) setTimeout(test, delay, resolve, reject);
        else {
          reject(
            new Error(
              `Wait: timed out after ${timeout}. Failed to validate: ${
                condition || 'condition description not provided'
              }`,
            ),
          );
        }
      })
      .catch(err => {
        if (Number(new Date()) < endTime) setTimeout(test, delay, resolve, reject);
        else {
          reject(
            new Error(
              `Wait: timed out after ${timeout}. Failed to validate ${
                condition || 'condition description not provided'
              }\nError: ${err}`,
            ),
          );
        }
      });
  };

  return new Promise(test);
};
