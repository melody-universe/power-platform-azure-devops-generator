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
  const environmentRegex = /%ENVIRONMENT%/g;
  const buildYamlPath = join(modulePath, yamlFileName);
  if (environmentRegex.test(buildYamlContents)) {
    const devYamlContents = buildYamlContents.replace(environmentRegex, "Dev");
    await writeFile(buildYamlPath, devYamlContents);
    await Promise.all(
      ["Prod"].map(async (environment) => {
        const envYamlPath = buildYamlPath.replace(
          /\.yml$/,
          `-${environment}.yml`
        );
        const envYamlContents = buildYamlContents.replace(
          environmentRegex,
          environment
        );
        await writeFile(envYamlPath, envYamlContents);
      })
    );
  } else {
    await writeFile(buildYamlPath, buildYamlContents);
  }
}
