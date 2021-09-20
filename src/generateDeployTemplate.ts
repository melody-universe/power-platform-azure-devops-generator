import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { ModulesPackage } from "./getModules";

export default async function generateDeployTemplate(
  root: string,
  modules: ModulesPackage
) {
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
        `${baseIndent}- download: Build${module}\r\n` +
        `${baseIndent}  name: Download${module}\r\n` +
        `${baseIndent}- powershell: |` +
        `${baseIndent}    $conn = Get-CrmConnection -ConnectionString "$(ConnectionString)"\r\n` +
        `${baseIndent}    Import-CrmDataFile \`\r\n` +
        `${baseIndent}      -CrmConnection $conn \`\r\n` +
        `${baseIndent}      -DataFile "$(Pipeline.Workspace)/Build${module}/data/data.zip" \`\r\n` +
        `${baseIndent}      -LogWriteDirectory "$(Pipeline.Workspace)/logs" \`\r\n` +
        `${baseIndent}      -EmitLogToConsole \`\r\n` +
        `${baseIndent}      -DisableTelemetry\r\n` +
        `${baseIndent}  name: Import${module}`
    )
    .join("\r\n");
  const outputContents = deployTemplateContents.replace(
    /%MODULES%/,
    importModulesText
  );
  const outputPath = join(root, "templates", "deploy.yml");
  await writeFile(outputPath, outputContents);
}
