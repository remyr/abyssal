import { Kind } from "graphql";

export function hasDefinitionWithName(nodes: any, name: any) {
  return nodes.findIndex((node: any) => node.name.value === name) !== -1;
}

export function isObjectTypeDefinition(def: any) {
  return (
    def.kind === Kind.OBJECT_TYPE_DEFINITION ||
    def.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
  );
}

export function isObjectSchemaDefinition(def: any) {
  return def.kind === Kind.SCHEMA_DEFINITION;
}
