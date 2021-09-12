import { writeFile } from "fs/promises";
import { join } from "path";
import { ModulesPackage } from "./getModules";

export default async function saveModules(
  modules: ModulesPackage,
  root: string
) {
  const contents = JSON.stringify(modules);
  const modulesPath = join(root, "modules.json");
  await writeFile(modulesPath, contents);
}
