import type { UserRecord } from "firebase-admin/auth";
import { commandErrorHandler, logErrorToDB } from "../logger";
import { asyncExecute } from "../../terminalUtils";

// Explicit flags for ad-hoc tsc runs on generated files: TypeScript 6+ changed
// the defaults (strict, ESM output, no implicit @types) and refuses to compile
// files given on the command line when a tsconfig.json is found.
export const tscFlags =
  "--ignoreConfig --skipLibCheck --strict false --module commonjs --target es2022 --types node";

export const addPackages = async (
  packages: { name: string; version?: string }[],
  user: UserRecord,
  streamLogger,
  buildPath
) => {
  const packagesString = packages.reduce((acc, currPackage) => {
    return `${acc} ${currPackage.name}@${currPackage.version ?? "latest"}`;
  }, "");
  if (packagesString.trim().length !== 0) {
    const success = await asyncExecute(
      `cd ${buildPath};yarn add ${packagesString}`,
      {
        callback: commandErrorHandler(
          {
            user,
            description: "Error adding packages",
          },
          streamLogger
        ),
      }
    );
    return success;
  }
  return true;
};
