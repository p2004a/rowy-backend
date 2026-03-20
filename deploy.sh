#!/bin/bash
name=rowy-backend
repository=main
region=europe-west1
helpFunction()
{
   echo "Usage: ./deploy.sh --project [YOUR GCLOUD PROJECT ID]"
   exit 0
}

while test $# -gt 0; do
           case "$1" in
                --project)
                    shift
                    project_id=$1
                    shift
                    ;;
                *)
                   echo "$1 is not a recognized flag!"
                   exit 1;
                   ;;
          esac
  done

if [[ -z "$project_id" ]];
then
   helpFunction
fi
gcloud --project $project_id run deploy $name --source . \
  --image ${region}-docker.pkg.dev/${project_id}/${repository}/${name} \
  --platform managed --cpu 1000m --memory 2Gi --allow-unauthenticated --region $region \
  --service-account rowy-backend@${project_id}.iam.gserviceaccount.com
