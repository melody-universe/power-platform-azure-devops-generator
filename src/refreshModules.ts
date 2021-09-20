import generateDeployPipeline from "./generateDeployPipeline";
import generateDeployTemplate from "./generateDeployTemplate";
import generateModuleFiles from "./generateModuleFiles";
import getModules from "./getModules";

export default async function refreshModules(root: any) {
  const modulesPackage = await getModules(root);

  await Promise.all([
    ...modulesPackage.modules.map((moduleName) =>
      generateModuleFiles(root, moduleName, modulesPackage)
    ),
    generateDeployTemplate(root, modulesPackage),
    generateDeployPipeline(root, "provision-dev.yml", modulesPackage),
    generateDeployPipeline(root, "deploy.yml", modulesPackage),
  ]);
}
