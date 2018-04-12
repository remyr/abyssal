/* tslint:disable variable-name */
import { Kind } from "graphql";
import { hasDefinitionWithName } from "./astHelpers";

const typesMap: {
  query: any;
  mutation: any;
  subscription: any;
  [key: string]: any;
} = {
  query: "Query",
  mutation: "Mutation",
  subscription: "Subscription",
};

const _mergeableOperationTypes = Object.keys(typesMap);

const _makeOperationType = (operation: any, value: any) => ({
  kind: Kind.OPERATION_TYPE_DEFINITION,
  operation,
  type: {
    kind: Kind.NAMED_TYPE,
    name: {
      kind: Kind.NAME,
      value,
    },
  },
});

const mergeableTypes = (Object as any).values(typesMap);

const makeSchema = (
  definitions: any,
  schemaDefs: any,
): {
  kind: any;
  directives: any[];
  operationTypes: any;
} => {
  const operationMap: {
    query: any;
    mutation: any;
    subscription: any;
    [key: string]: any;
  } = {
    query: _makeOperationType(_mergeableOperationTypes[0], mergeableTypes[0]),
    mutation: null,
    subscription: null,
  };

  mergeableTypes.slice(1).forEach((type: any, key: any) => {
    if (hasDefinitionWithName(definitions, type)) {
      const operation = _mergeableOperationTypes[key + 1];

      operationMap[operation] = _makeOperationType(operation, type);
    }
  });

  const operationTypes = (Object as any)
    .values(operationMap)
    .map((operation: any, i: any) => {
      if (!operation) {
        const type = Object.keys(operationMap)[i];

        if (
          schemaDefs.some((def: any) =>
            def.operationTypes.some((op: any) => op.operation === type),
          )
        ) {
          return _makeOperationType(type, typesMap[type]);
        }
      }

      return operation;
    })
    .filter((op: any) => op);

  return {
    kind: Kind.SCHEMA_DEFINITION,
    directives: [],
    operationTypes,
  };
};

export { mergeableTypes, makeSchema };
