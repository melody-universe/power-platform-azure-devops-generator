import { Command } from "commander";
import { resolve } from "path";
import generateConfigSolution from "./generateConfigSolution";
import generateNewModule from "./generateNewModule";
import refreshModules from "./refreshModules";

const program = new Command();
program.version(process.env.npm_package_version as string);

const rootArgument = [
  "[root]",
  "root folder of the repository",
  resolve,
  "..",
] as const;

program
  .command("new")
  .argument("<name>", "name of the module")
  .argument(...rootArgument)
  .description("generate a new configuration module")
  .action((name, root) => {
    generateNewModule(name, root);
  });

program
  .command("refresh")
  .argument(...rootArgument)
  .description("regenerate all schema and yaml files")
  .action((root) => {
    refreshModules(root);
  });

program
  .command("generate-solution")
  .argument(...rootArgument)
  .description(
    "generate the configuration modularization solution from a base schema file"
  )
  .action((root) => generateConfigSolution(root));

program.parse();
