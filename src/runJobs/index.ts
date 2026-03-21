import { Request } from "express";
import { getProjectId } from "../metadataService";

export const triggerJob = async (req: Request) => {
  const { jobName, region } = req.body;

  try {
    // fetch access token https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances#applications
    const [projectId, tokenRes] = await Promise.all([
      getProjectId(),
      fetch(
        `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token`,
        {
          method: "GET",
          headers: {
            "Metadata-Flavor": `Google`,
          },
          signal: AbortSignal.timeout(1000),
        }
      ),
    ]);
    if (!tokenRes.ok) {
      throw new Error(`Token fetch failed: ${tokenRes.status} ${tokenRes.statusText}`);
    }
    const tokenData = await tokenRes.json();
    const res = await fetch(
      `https://${
        region ?? "us-central1"
      }-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${projectId}/jobs/${jobName}:run`,
      {
        method: "POST",
        headers: {
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
        signal: AbortSignal.timeout(1000),
      }
    );
    console.log(`status ${res.status} ${res.statusText}`);
    return {
      success: res.ok,
      message: `status ${res.status} ${res.statusText}`,
    };
  } catch (e: any) {
    console.error("Error triggering job", e);
    return {
      success: false,
      error: e.message,
    };
  }
};
