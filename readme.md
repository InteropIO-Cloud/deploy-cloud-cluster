# Deploy Cloud Cluster Github Action

This action is designed to be used in the io.Cloud CD pipeline to deploy the kubernetes cluster of a io.Cloud instance.

In addition to the required inputs, this action requires three environment variables to be set: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`. These are used to authenticate with AWS EKS to authorize kubectl.

Usage:
```yaml
- name: Deploy Cloud Cluster
  uses: interopio-cloud/deploy-cloud-cluster:1.0.0
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_REGION: ${{ secrets.AWS_REGION }}
    with:
      tag-name: ${{ github.event.release.tag_name }}
      region: ${{ secrets.AWS_REGION }}
      working-dir: ${{ github.workspace }}
      cluster-name: cloud-acme-wealth-eks-cluster
      services: '["admin", "config", "home", "proxy", "server"]'
```

The action either exits with 0, if the docker image was successfully built and deployed, or 1 if not.

**Naming Convention**

The action expects the following naming convention for the kubernetes files:
- all kubernetes files must be in the `kubernetes` directory
- the kubernetes file for the service must be the only one that includes the service name in the file name