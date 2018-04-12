/* tslint:disable variable-name */
import { parse } from "graphql";
import { getDescription } from "graphql/utilities/buildASTSchema";
import print from "./utilities/astPrinter";
import {
  isObjectTypeDefinition,
  isObjectSchemaDefinition,
} from "./utilities/astHelpers";
import { makeSchema, mergeableTypes } from "./utilities/makeSchema";

const _isMergeableTypeDefinition = (def: any, all: any) =>
  isObjectTypeDefinition(def) &&
  (mergeableTypes.includes(def.name.value) || all);

const _isNonMergeableTypeDefinition = (def: any, all: any) =>
  !_isMergeableTypeDefinition(def, all);

const _makeCommentNode = (value: any) => ({ kind: "Comment", value });

const _addCommentsToAST = (nodes: any, flatten = true) => {
  const astWithComments = nodes.map((node: any) => {
    const description = getDescription(node, { commentDescriptions: true });
    if (description) {
      return [_makeCommentNode(description), node];
    }

    return [node];
  });

  if (flatten) {
    return astWithComments.reduce((a: any, b: any) => a.concat(b), []);
  }

  return astWithComments;
};

const _makeRestDefinitions = (defs: any, all = false) =>
  defs
    .filter(
      (def: any) =>
        _isNonMergeableTypeDefinition(def, all) &&
        !isObjectSchemaDefinition(def),
    )
    .map((def: any) => {
      if (isObjectTypeDefinition(def)) {
        return {
          ...def,
          fields: _addCommentsToAST(def.fields),
        };
      }

      return def;
    });

const _makeMergedFieldDefinitions = (merged: any, candidate: any) =>
  _addCommentsToAST(candidate.fields).reduce((fields: any, field: any) => {
    const original = merged.fields.find(
      (base: any) =>
        base.name &&
        typeof base.name.value !== "undefined" &&
        field.name &&
        typeof field.name.value !== "undefined" &&
        base.name.value === field.name.value,
    );
    if (!original) {
      fields.push(field);
    } else if (field.type.name.value !== original.type.name.value) {
      throw new Error(
        `Conflicting types for ${merged.name.value}.${field.name.value}: ` +
          `${field.type.name.value} != ${original.type.name.value}`,
      );
    }
    return fields;
  }, merged.fields);

const _makeMergedDefinitions = (defs: any, all = false) => {
  // TODO: This function can be cleaner!
  const groupedMergableDefinitions = defs
    .filter((def: any) => _isMergeableTypeDefinition(def, all))
    .reduce(
      (mergableDefs: any, def: any) => {
        const name = def.name.value;

        if (!mergableDefs[name]) {
          return {
            ...mergableDefs,
            [name]: {
              ...def,
              fields: _addCommentsToAST(def.fields),
            },
          };
        }

        return {
          ...mergableDefs,
          [name]: {
            ...mergableDefs[name],
            fields: _makeMergedFieldDefinitions(mergableDefs[name], def),
          },
        };
      },
      {
        Query: null,
        Mutation: null,
        Subscription: null,
      },
    );

  return (Object as any)
    .values(groupedMergableDefinitions)
    .reduce((array: any[], def: any) => (def ? [...array, def] : array), []);
};

const _makeDocumentWithDefinitions = (definitions: any) => ({
  kind: "Document",
  definitions: definitions instanceof Array ? definitions : [definitions],
});

const printDefinitions = (defs: any) =>
  print(_makeDocumentWithDefinitions(defs));

const mergeTypes = (types: any, options = { all: false }) => {
  const allDefs = types
    .map((type: any) => {
      if (typeof type === "string") {
        return parse(type);
      }
      return type;
    })
    .map((ast: any) => ast.definitions)
    .reduce((defs: any, newDef: any) => [...defs, ...newDef], []);

  const mergedDefs = _makeMergedDefinitions(allDefs, options.all);
  const rest = _addCommentsToAST(
    _makeRestDefinitions(allDefs, options.all),
    false,
  ).map(printDefinitions);
  const schemaDefs = allDefs.filter(isObjectSchemaDefinition);
  const schema = printDefinitions([
    makeSchema(mergedDefs, schemaDefs),
    ...mergedDefs,
  ]);

  return [schema, ...rest].join("\n");
};

export default mergeTypes;
