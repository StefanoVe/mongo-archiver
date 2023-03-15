export const isProduction = process.env.PRODUCTION === '1';

export const declareEnvs = (envs: string[]) => {
  envs.forEach((name) => {
    if (!process.env[name]) {
      throw new Error(name);
    }
  });

  return process.env;
};

/**
 * a for loop that waits for the callback to finish before moving on to the next iteration.
 * @param {any[]} array - the array you want to loop through
 * @param callback - The function to execute on each element in the array.
 */
export const asyncForEach = async <T>(
  array: T[],
  callback: (curr: T, index: number, array: unknown[]) => unknown
) => {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
};

/**
 * It takes a message and a type, and logs the message in a color based on the type
 * @param {string} msg - The message to be displayed.
 * @param {'success' | 'info' | 'error' | 'start' | 'warning' | 'end'} type - 'success' | 'info' |
 * 'error' | 'start' | 'warning' | 'end'
 */
export const colorfulLog = (
  msg: string,
  type: 'success' | 'info' | 'error' | 'start' | 'warning' | 'end'
) => {
  let color = 'white';
  // const  bgc = "White";
  switch (type) {
    case 'success':
      color = '\u001b[1;32m';
      break;
    case 'info':
      color = '\u001b[1;36m';
      break;
    case 'error':
      color = '\u001b[1;31m';
      break;
    case 'start':
      color = '\u001b[1;35m';
      break;
    case 'warning':
      color = '\u001b[1;33m';
      break;
    case 'end':
      color = '\u001b[1;35m';
      break;
  }

  console.log(color + msg + '\u001b[0m');
};
