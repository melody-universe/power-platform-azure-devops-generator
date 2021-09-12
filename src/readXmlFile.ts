import { readFile } from "fs/promises";
import { parseStringPromise as parseXml } from "xml2js";

export default async function readXmlFile(filePath: string): Promise<any> {
  const contents = await readFile(filePath);
  const json = await parseXml(contents);
  return json;
}
