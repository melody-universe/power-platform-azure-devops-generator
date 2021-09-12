import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ModulesPackage } from "./getModules";

export default async function generateDeployPipeline(
  fileName: string,
  modules: ModulesPackage
) {
  const pipelineTemplatePath = join(__dirname, "..", "templates", fileName);
  const pipelineTemplateContents = (
    await readFile(pipelineTemplatePath)
  ).toString();

  const downloadModulesText = modules.modules
    .map(
      (module) =>
        `    - pipeline: build-${module}\r\n` +
        "      branch: main\r\n" +
        `      source: build-${module}\r\n` +
        "      trigger:\r\n" +
        "        branches:\r\n" +
        "          include:\r\n" +
        "            - main"
    )
    .join("\r\n");
  const outputContents = pipelineTemplateContents.replace(
    /%MODULES%/,
    downloadModulesText
  );
  const outputPath = join(__dirname, "..", "..", fileName);
  await writeFile(outputPath, outputContents);
}
