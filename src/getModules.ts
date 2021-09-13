import { readFile } from "fs/promises";
import { join } from "path";

export default async function getModules(
  root: string
): Promise<ModulesPackage> {
  const modulesPath = join(root, "modules.json");
  const buffer = await readFile(modulesPath);
  const contents = buffer.toString();
  const modules = JSON.parse(contents) as ModulesPackage;
  return modules;
}

export interface ModulesPackage {
  prefix: string;
  modules: string[];
}
