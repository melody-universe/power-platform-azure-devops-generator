import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ModulesPackage } from "./getModules";

export default async function generateDeployTemplate(modules: ModulesPackage) {
  const deployTemplatePath = join(
    __dirname,
    "..",
    "templates",
    "deploy-template.yml"
  );
  const deployTemplateContents = (
    await readFile(deployTemplatePath)
  ).toString();

  const baseIndent = "            ";
  const importModulesText = modules.modules
    .map(
      (module) =>
        `${baseIndent}- template: import-module.yml\r\n` +
        `${baseIndent}  parameters:\r\n` +
        `${baseIndent}    moduleName: ${module}`
    )
    .join("\r\n");
  const outputContents = deployTemplateContents.replace(
    /%MODULES%/,
    importModulesText
  );
  const outputPath = join(__dirname, "..", "..", "templates", "deploy.yml");
  await writeFile(outputPath, outputContents);
}
