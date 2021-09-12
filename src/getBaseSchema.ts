import { join } from "path";
import readXmlFile from "./readXmlFile";
import templatesFolder from "./templatesFolder";

export default async function getBaseSchema() {
  const baseSchemaXmlPath = join(templatesFolder, "base-schema.xml");
  const baseSchema = await readXmlFile(baseSchemaXmlPath);
  return baseSchema;
}
