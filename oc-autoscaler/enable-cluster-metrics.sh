#!/bin/bash

# what this should be?
HAWKULAR_METRICS_HOSTNAME=localhost
alias oadm='oc adm'

oc project openshift-infra
oc create -f - <<API
apiVersion: v1
kind: ServiceAccount
metadata:
  name: metrics-deployer
secrets:
- name: metrics-deployer
API
oadm policy add-role-to-user edit system:serviceaccount:openshift-infra:metrics-deployer
oadm policy add-cluster-role-to-user cluster-reader system:serviceaccount:openshift-infra:heapster
oc secrets new metrics-deployer nothing=/dev/null
oc process -f ./metrics-deployer.yaml -v HAWKULAR_METRICS_HOSTNAME=$HAWKULAR_METRICS_HOSTNAME,USE_PERSISTENT_STORAGE=false,REDEPLOY=true | oc create -f -

echo "Make sure to add the follwoing to master-config.xml and restart master. Note the URL should end with '/hawkular/metrics'"
echo "metricsPublicURL: https://$HAWKULAR_METRICS_HOSTNAME/hawkular/metrics"
