import { readFile } from "fs/promises";
import { parseStringPromise as parseXml } from "xml2js";

export default async function readXmlFile<TSchema = any >(
  filePath: string
): Promise<TSchema> {
  const contents = await readFile(filePath);
  const json = (await parseXml(contents)) as TSchema;
  return json;
}
