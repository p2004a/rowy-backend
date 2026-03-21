import { Request, Response } from "express";

const metadataBaseURL = "http://metadata.google.internal/";
const metadataHeaders = { "Metadata-Flavor": "Google" };

const metadataGet = async (path: string): Promise<string> => {
  const response = await fetch(`${metadataBaseURL}${path}`, {
    headers: metadataHeaders,
    signal: AbortSignal.timeout(1000),
  });
  if (!response.ok) {
    throw new Error(`Metadata request failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
};

export const metadataService = (req: Request, res: Response) => {
  let path =
    req.query.path ||
    "computeMetadata/v1/instance/service-accounts/default/scopes";
  metadataGet(path as string).then((data) => {
    res.send({ data });
  });
};
export const getServiceAccountEmail = async () =>
  (
    await metadataGet("computeMetadata/v1/instance/service-accounts")
  ).split("\n")[1];
export const getProjectId = async () =>
  metadataGet("computeMetadata/v1/project/project-id");
export const getNumericProjectId = async () =>
  metadataGet("computeMetadata/v1/project/numeric-project-id");

export const generateServiceAccessToken = async (audience) =>
  metadataGet(
    `computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`
  );
