import { ExitCode, getInput, notice, setOutput, warning } from "@actions/core"
import { exec } from "@actions/exec"
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseAllDocuments, Document } from 'yaml'

const updateServiceContainerImageTag = async (k8sDeployDir, serviceName, tagName) => {

    const k8sDirContents = await readdir(k8sDeployDir, "utf-8");

    const serviceYamlFiles = k8sDirContents.filter((item) => item.includes(serviceName));

    if (!serviceYamlFiles || !serviceYamlFiles.length) {
        warning(`No service yaml files found for service ${serviceName}`);
        process.exit(ExitCode.Failure);
    }

    if (serviceYamlFiles.length > 1) {
        warning(`More than one service yaml file found for service ${serviceName}`);
        process.exit(ExitCode.Failure);
    }

    const serviceYamlFile = serviceYamlFiles[0];

    const file = await readFile(k8sDeployDir, serviceYamlFile, "utf8");

    const parsedYmlDocs = parseAllDocuments(file);

    const k8sDefinitions = parsedYmlDocs.map((doc) => doc.toJS());

    const deploymentDefinition = k8sDefinitions.find((def) => def.kind === "Deployment");

    const currentContainerImageWithTag = deploymentDefinition.spec.template.spec.containers[0].image;

    const currentContainerImage = currentContainerImageWithTag.split(":")[0];

    deploymentDefinition.spec.template.spec.containers[0].image = `${currentContainerImage}:${tagName}`;

    const newFile = k8sDefinitions
        .map((k8sDef) => new Document(k8sDef))
        .map((doc) => doc.toString())
        .join("---\n");

    await writeFile(join(k8sDeployDir, serviceYamlFile), newFile);
};

const run = async () => {

    const workingDir = getInput("working-dir", { required: true });
    const region = getInput("region", { required: true });
    const tagName = getInput("tag-name", { required: true });
    const clusterName = getInput("cluster-name", { required: true });
    const servicesRaw = getInput("services", { required: true }); // '["asd","das"]'

    const services = JSON.parse(servicesRaw);

    const k8sBaseDir = join(workingDir, "kubernetes");

    const k8sDeployDir = join(workingDir, "_k8s_");

    notice(`Copying k8s files from ${k8sBaseDir} to ${k8sDeployDir}`);

    await cp(k8sBaseDir, k8sDeployDir, { recursive: true });

    for (const service of services) {
        notice(`Updating service ${service} with tag ${tagName}`);

        await updateServiceContainerImageTag(k8sDeployDir, service, tagName);

        notice(`Service ${service} updated with tag ${tagName}`);
    }

    notice(`Configuring kubectl for cluster ${clusterName} in region ${region}`);

    await exec(`aws eks --region ${region} update-kubeconfig --name ${clusterName}`);

    notice(`Deploying k8s files from ${k8sDeployDir}`);

    await exec(`kubectl apply -f ${k8sDeployDir}`);

    setOutput("depl-dir-name", "_k8s_");

    notice(`K8s files deployed successfully.`);
};

run();
