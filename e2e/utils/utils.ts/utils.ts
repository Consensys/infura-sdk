export default async function wait(
  // eslint-disable-next-line no-unused-vars
  fn: (...args: any) => Promise<boolean>,
  timeout = 30000,
  delay = 200,
  condition = '',
): Promise<any> {
  const startTime = Number(new Date());
  const endTime: number = startTime + timeout;

  const test = (resolve: (arg0: boolean) => void, reject: (arg0: Error) => void) => {
    const result: Promise<boolean> = fn();

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
}

export const existingContractAddress = '0x80c9B1a1310d4f38fF1AD0450d2c242780F27259';

export const existingBatchContractAddress = '0x1b691BD7ca1F05aB0E9AF2287CF6c713eAA67AF2';
