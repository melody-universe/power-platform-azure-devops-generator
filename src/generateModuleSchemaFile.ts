import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { parseStringPromise as parseXml, Builder as XmlBuilder } from "xml2js";

const templatesFolderPath = join(__dirname, "..", "templates");

export default async function generateModuleSchemaFile(
  moduleName: string,
  outputFilePath: string,
  prefix: string
) {
  const moduleTableName = `${prefix}_config_module`;
  const moduleTablePrimaryField = `${prefix}_name`;

  const baseSchemaXmlPath = join(templatesFolderPath, "base-schema.xml");

  const baseSchema = await readXmlFile(baseSchemaXmlPath);
  for (const entity of baseSchema.entities.entity) {
    configurePortalEntity(
      entity,
      moduleName,
      moduleTableName,
      moduleTablePrimaryField
    );
  }

  const moduleEntity = await buildModuleEntity(
    moduleName,
    moduleTableName,
    moduleTablePrimaryField
  );
  baseSchema.entities.entity.push(moduleEntity);

  await writeXmlFile(outputFilePath, baseSchema);
}

function configurePortalEntity(
  entity: any,
  moduleName: string,
  moduleTableName: string,
  moduleTablePrimaryField: string
) {
  let query;
  const entityName = entity.$.name;
  if (entityName === "annotation") {
    query = {
      fetch: {
        entity: {
          $: { name: "annotation" },
          "link-entity": {
            $: {
              "link-type": "inner",
              name: "adx_webfile",
              from: "adx_webfileid",
              to: "objectid",
            },
            "link-entity": createModuleEntityLink(
              "adx_webfile",
              moduleName,
              moduleTableName,
              moduleTablePrimaryField
            ),
          },
        },
      },
    };
  } else {
    query = {
      fetch: {
        entity: {
          $: { name: entityName },
          "link-entity": createModuleEntityLink(
            entityName,
            moduleName,
            moduleTableName,
            moduleTablePrimaryField
          ),
        },
      },
    };
  }
  const builder = new XmlBuilder({ headless: true });
  const fetchXml = builder.buildObject(query);
  entity.filter = fetchXml;

  const relationshipName = `${moduleTableName}_${entityName}`.substr(0, 39);
  const moduleRelationship = {
    $: {
      name: relationshipName,
      manyToMany: "true",
      isreflexive: "false",
      relatedEntityName: relationshipName,
      m2mTargetEntity: moduleTableName,
      m2mTargetEntityPrimaryKey: `${moduleTableName}id`,
    },
  };
  if (entityName !== "annotation") {
    if (entity.relationships) {
      if (typeof entity.relationships[0] === "string") {
        entity.relationships.shift();
        entity.relationships.push({ relationship: [] });
      }
    } else {
      entity.relationships = [{ relationship: [] }];
    }
    entity.relationships[0].relationship.push(moduleRelationship);
  }
}

function createModuleEntityLink(
  tableName: string,
  moduleName: string,
  moduleTableName: string,
  moduleTablePrimaryField: string
) {
  return {
    $: {
      "link-type": "inner",
      name: `${moduleTableName}_${tableName}`.substr(0, 39),
      from: `${tableName}id`,
      to: `${tableName}id`,
    },
    "link-entity": {
      $: {
        "link-type": "inner",
        name: moduleTableName,
        from: `${moduleTableName}id`,
        to: `${moduleTableName}id`,
      },
      filter: createModuleEntityFilter(moduleName, moduleTablePrimaryField),
    },
  };
}

async function buildModuleEntity(
  moduleName: string,
  moduleTableName: string,
  moduleTablePrimaryField: string
) {
  const moduleSchemaXmlPath = join(templatesFolderPath, "module-schema.xml");
  const schema = await readXmlFile(moduleSchemaXmlPath);
  const entity = schema.entities.entity[0];
  const filter = {
    fetch: {
      entity: {
        $: { name: moduleTableName },
        filter: createModuleEntityFilter(moduleName, moduleTablePrimaryField),
      },
    },
  };
  const builder = new XmlBuilder({ headless: true });
  const filterXml = builder.buildObject(filter);
  entity.filter = filterXml;
  return entity;
}

async function readXmlFile(filePath: string): Promise<any> {
  const contents = await readFile(filePath);
  const json = await parseXml(contents);
  return json;
}

async function writeXmlFile(filePath: string, json: any): Promise<void> {
  const builder = new XmlBuilder();
  const content = builder.buildObject(json);
  await writeFile(filePath, content);
}

function createModuleEntityFilter(
  moduleName: string,
  moduleTablePrimaryField: string
) {
  return {
    condition: {
      $: {
        attribute: moduleTablePrimaryField,
        operator: "eq",
        value: moduleName,
      },
    },
  };
}
