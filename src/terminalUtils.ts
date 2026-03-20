import * as child from "child_process";

export function execute(command: string, callback: any) {
  console.log(command);
  child.exec(command, function (error, stdout, stderr) {
    console.log({ error, stdout, stderr });
    callback(stdout);
  });
}

export const asyncExecute = async (
  command: string,
  options?: {
    callback?: any;
    logger?: any;
    rejectOnError?: boolean;
  }
) => {
  options?.logger?.info(`Executing: ${command}`);
  return new Promise(async (resolve, reject) => {
    child.exec(command, async function (error, stdout, stderr) {
      options?.logger?.info(
        `stdout: ${JSON.stringify({ error, stdout, stderr })}`
      );
      await options?.callback?.(error, stdout, stderr);
      if (error && options?.rejectOnError) {
        reject(error);
      } else {
        resolve(!error);
      }
    });
  });
};
