import type { UserRecord } from "firebase-admin/auth";
import { commandErrorHandler, logErrorToDB } from "../logger";
import { addPackages, tscFlags } from "./terminal";
import { asyncExecute } from "../../terminalUtils";
import { getExtension } from "../../rowyService";

export const addExtensionLib = async (
  name: string,
  user: UserRecord,
  streamLogger,
  buildPath,
  buildFolderTimestamp
) => {
  try {
    const extensionResp = await getExtension(name);
    const { extension, dependencies } = extensionResp;
    const packages = Object.keys(dependencies).map((key) => ({
      name: key,
      version: dependencies[key],
    }));
    const success = await addPackages(packages, user, streamLogger, buildPath);
    if (!success) {
      return false;
    }
    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(
      path.resolve(
        __dirname,
        `../builds/${buildFolderTimestamp}/src/extensions/${name}.ts`
      ),
      extension
    );
    await asyncExecute(`cd ${buildPath}/src/extensions;tsc ${tscFlags} ${name}.ts`, {
      callback: commandErrorHandler(
        {
          user,
          description: "Error compiling extensionsLib",
        },
        streamLogger
      ),
      rejectOnError: true,
    });
  } catch (error) {
    console.log(error);
    logErrorToDB(
      {
        user,
        errorDescription: `Error installing extension ${name}`,
      },
      streamLogger
    );
    return false;
  }
  return true;
};
