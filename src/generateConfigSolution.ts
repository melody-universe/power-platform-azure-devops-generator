import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { join, resolve, dirname } from "path";
import glob from "tiny-glob";
import { Builder as XmlBuilder, parseStringPromise as parseXml } from "xml2js";
import getBaseSchema from "./getBaseSchema";
import getModules from "./getModules";
import readXmlFile from "./readXmlFile";
import templatesFolder from "./templatesFolder";

export default async function generateConfigSolution(root: string) {
  const modules = await getModules(root);
  const sourceFolder = join(templatesFolder, "config-modularization-solution");
  const destinationFolder = resolve(root, "config-modularization/solution");
  const solutionFiles = await glob("**/*.xml", {
    cwd: sourceFolder,
  });
  await rm(destinationFolder, { force: true, recursive: true });
  await mkdir(destinationFolder);
  const outputFiles = await Promise.all(
    solutionFiles.map(async (sourceFile) => {
      const template = (
        await readFile(resolve(sourceFolder, sourceFile))
      ).toString();
      const outputPath = sourceFile.replace(/%PREFIX%/g, modules.prefix);
      const output = template.replace(/%PREFIX%/g, modules.prefix);
      return { path: outputPath, contents: output };
    })
  );
  const baseSchema = await getBaseSchema();
  const schemaEntities: string[] = baseSchema.entities.entity
    .map((e: any) => e.$.name)
    .filter((name: string) => name !== "annotation");

  const relationshipsFile = outputFiles.find(
    (file) => file.path === "Other\\Relationships.xml"
  ) as { contents: string };
  const relationshipsXml = await parseXml(relationshipsFile.contents);
  const relationshipTemplate = (
    await readFile(join(templatesFolder, "entity-relationship.xml"))
  ).toString();
  schemaEntities.forEach((entity) => {
    const relationshipName =
      `${modules.prefix}_config_module_${entity}_${entity}`.substring(0, 41);
    const intersectEntityName =
      `${modules.prefix}_config_module_${entity}`.substring(0, 39);
    relationshipsXml.EntityRelationships.EntityRelationship.push({
      $: {
        Name: relationshipName,
      },
    });
    const entityRelationshipFile = relationshipTemplate
      .replace(/%RELATIONSHIP_NAME%/g, relationshipName)
      .replace(/%INTERSECT_ENTITY_NAME%/g, intersectEntityName)
      .replace(/%PREFIX%/g, modules.prefix)
      .replace(/%ENTITY_NAME%/g, entity);
    outputFiles.push({
      path: `Other\\Relationships\\${entity}.xml`,
      contents: entityRelationshipFile,
    });
  });
  const builder = new XmlBuilder();
  relationshipsFile.contents = builder.buildObject(relationshipsXml);

  const solutionXmlFile = outputFiles.find(
    (file) => file.path === "Other\\Solution.xml"
  ) as { contents: string };
  const solutionXml = await parseXml(solutionXmlFile.contents);
  const publisherSolutionXml = await readXmlFile(
    join(root, "publisher/solution/Other/Solution.xml")
  );
  solutionXml.ImportExportXml.SolutionManifest[0].Publisher =
    publisherSolutionXml.ImportExportXml.SolutionManifest[0].Publisher;
  solutionXmlFile.contents = builder.buildObject(solutionXml);

  const directories = Array.from(
    new Set(outputFiles.map((file) => dirname(file.path)))
  );
  await Promise.all(
    directories.map((dir) =>
      mkdir(join(destinationFolder, dir), { recursive: true })
    )
  );
  await Promise.all(
    outputFiles.map((file) =>
      writeFile(join(destinationFolder, file.path), file.contents)
    )
  );
}
