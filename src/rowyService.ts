import { generateServiceAccessToken, getProjectId } from "./metadataService";

const meta = require("../package.json");

const getServiceConfig = async () => {
  const baseURL =
    process.env.DEV === "true"
      ? "https://rowy-run-service-gkxqefhk3q-uc.a.run.app"
      : "https://rowy.run/";
  const authToken = await generateServiceAccessToken(baseURL);
  return {
    baseURL: baseURL.endsWith("/") ? baseURL : baseURL + "/",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    },
  };
};

export const getExtension = async (
  extensionId: string
): Promise<{
  dependencies: { [key: string]: string };
  extension: string;
  syncScript?: string;
}> => {
  const config = await getServiceConfig();
  const response = await fetch(`${config.baseURL}extensions/${extensionId}`, {
    headers: config.headers,
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) {
    throw new Error(`getExtension failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

let projectId;

const telemetryBaseURL = "https://rowy.events/";
const telemetryHeaders = { "Content-Type": "application/json" };

const telemetryPost = async (path: string, body: object) => {
  const response = await fetch(`${telemetryBaseURL}${path}`, {
    method: "POST",
    headers: telemetryHeaders,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) {
    throw new Error(`Telemetry request failed: ${response.status} ${response.statusText}`);
  }
  return response;
};

export const telemetry = async (event) => {
  if (!projectId) {
    projectId = await getProjectId();
  }
  const body = {
    projectId,
    event,
    source: meta.name,
  };
  return telemetryPost(`monitor`, body);
};

export const telemetryError = async (event, error) => {
  if (!projectId) {
    projectId = await getProjectId();
  }
  const body = {
    projectId,
    event,
    source: meta.name,
    error: JSON.stringify(error),
  };
  console.log("error", body);
  return telemetryPost(`error`, body);
};

export const telemetryRuntimeDependencyPerformance = async ({
  functionStartTime,
  functionEndTime,
  yarnStartTime,
  yarnFinishTime,
  dependenciesString,
}) => {
  if (!projectId) {
    projectId = await getProjectId();
  }
  const body = {
    projectId,
    source: meta.name,
    functionStartTime,
    functionEndTime,
    yarnStartTime,
    yarnFinishTime,
    dependenciesString,
  };
  return telemetryPost(`runtime-dependency-performance`, body);
};

export const inviteUserService = async (
  projectId: string,
  newUser: {
    email: string;
    uid: string;
    roles: string[];
  },
  inviter: {
    email: string;
    uid: string;
    name: string;
  }
): Promise<{
  dependencies: { [key: string]: string };
  extension: string;
  syncScript?: string;
}> => {
  const config = await getServiceConfig();
  const response = await fetch(`${config.baseURL}inviteUser`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ projectId, newUser, inviter }),
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) {
    throw new Error(`inviteUser failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};
