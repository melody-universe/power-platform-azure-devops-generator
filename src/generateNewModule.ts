import getModules from "./getModules";
import saveModules from "./saveModules";
import generateDeployTemplate from "./generateDeployTemplate";
import generateDeployPipeline from "./generateDeployPipeline";
import generateModuleFiles from "./generateModuleFiles";

export default async function generateNewModule(name: string, root: string) {
  const modulesPackage = await getModules(root);
  if (!modulesPackage.modules.some((m) => m === name)) {
    modulesPackage.modules.push(name);
  }

  await Promise.all([
    generateModuleFiles(root, name, modulesPackage),
    generateDeployTemplate(root, modulesPackage),
    // generateDeployPipeline("provision-dev.yml", modulesPackage),
    generateDeployPipeline(root, "deploy.yml", modulesPackage),
    saveModules(modulesPackage, root),
  ]);
}
