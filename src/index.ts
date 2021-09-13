import { Command } from "commander";
import { resolve } from "path";
import { cwd } from "process";
import generateConfigSolution from "./generateConfigSolution";
import generateNewModule from "./generateNewModule";
import initializeProject from "./initializeProject";
import refreshModules from "./refreshModules";

const program = new Command();
program.version(process.env.npm_package_version as string);

const rootOption = [
  "-r, --root <root>",
  "root folder of the repository",
  cwd(),
] as const;

program
  .command("init")
  .option(
    "-p, --publisherSolution <publisherSolution>",
    "name of an empty solution containing the publisher to be used for this project",
    "Publisher"
  )
  .description("initialize a new Azure DevOps project")
  .action(initializeProject);

program
  .command("new")
  .requiredOption("-n, --name <name>", "name of the module")
  .option(...rootOption)
  .description("generate a new configuration module")
  .action(({ name, root }: { name: string; root: string }) => {
    generateNewModule(name, root);
  });

program
  .command("refresh")
  .option(...rootOption)
  .description("regenerate all schema and yaml files")
  .action((root) => {
    refreshModules(root);
  });

program
  .command("generate-solution")
  .option(...rootOption)
  .description(
    "generate the configuration modularization solution from a base schema file"
  )
  .action((root) => generateConfigSolution(root));

program.parse();
