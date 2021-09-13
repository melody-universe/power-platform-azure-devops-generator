import { mkdir, access } from "fs/promises";
import { join } from "path";
import generateModuleSchemaFile from "./generateModuleSchemaFile";
import generateModuleYamlFile from "./generateModuleYamlFile";
import { ModulesPackage } from "./getModules";

export default async function generateModuleFiles(
  root: string,
  name: string,
  modulesPackage: ModulesPackage
) {
  const path = join(root, name);
  if (!(await exists(path))) await mkdir(path);

  const moduleSchemaPath = join(path, "schema.xml");

  await Promise.all([
    generateModuleYamlFile(name, path, "build.yml"),
    generateModuleYamlFile(name, path, "commit.yml"),
    generateModuleSchemaFile(name, moduleSchemaPath, modulesPackage.prefix),
  ]);
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
