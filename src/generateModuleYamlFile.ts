import { join } from "path";
import { readFile, writeFile } from "fs/promises";

export default async function generateModuleYamlFile(
  moduleName: string,
  modulePath: string,
  yamlFileName: string
) {
  const buildYamlTemplatePath = join(
    __dirname,
    "..",
    "templates",
    yamlFileName
  );
  const buildYamlTemplateContents = (
    await readFile(buildYamlTemplatePath)
  ).toString();
  const buildYamlContents = buildYamlTemplateContents.replace(
    /%MODULE_NAME%/g,
    moduleName
  );
  const buildYamlPath = join(modulePath, yamlFileName);
  await writeFile(buildYamlPath, buildYamlContents);
}
