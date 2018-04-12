/* eslint-disable */
/* tslint:disable */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * ==> This file has been modified just to add comments to the printed AST
 */

import { visit } from "graphql/language/visitor";

/**
 * Converts an AST into a string, using one set of reasonable
 * formatting rules.
 */
export default function print(ast: any) {
  return visit(ast, { leave: printDocASTReducer });
}

const printDocASTReducer = {
  Name: (node: any) => node.value,
  Variable: (node: any) => "$" + node.name,

  // Document

  Document: (node: any) =>
    node.definitions
      .map((node: any) => {
        return `${node}\n${node[0] === "#" ? "" : "\n"}`;
      })
      .join("")
      .trim() + "\n",

  OperationDefinition(node: any) {
    const op = node.operation;
    const name = node.name;
    const varDefs = wrap("(", join(node.variableDefinitions, ", "), ")");
    const directives = join(node.directives, " ");
    const selectionSet = node.selectionSet;
    // Anonymous queries with no directives or variable definitions can use
    // the query short form.
    return !name && !directives && !varDefs && op === "query"
      ? selectionSet
      : join([op, join([name, varDefs]), directives, selectionSet], " ");
  },

  VariableDefinition: ({
    variable,
    type,
    defaultValue,
  }: {
    variable: any;
    type: any;
    defaultValue: any;
  }) => variable + ": " + type + wrap(" = ", defaultValue),

  SelectionSet: ({ selections }: { selections: any }) => block(selections),

  Field: ({
    alias,
    name,
    arguments: args,
    directives,
    selectionSet,
  }: {
    alias: any;
    name: any;
    arguments: any;
    directives: any;
    selectionSet: any;
  }) =>
    join(
      [
        wrap("", alias, ": ") + name + wrap("(", join(args, ", "), ")"),
        join(directives, " "),
        selectionSet,
      ],
      " ",
    ),

  Argument: ({ name, value }: { name: any; value: any }) => name + ": " + value,

  // Fragments

  FragmentSpread: ({ name, directives }: { name: any; directives: any }) =>
    "..." + name + wrap(" ", join(directives, " ")),

  InlineFragment: ({
    typeCondition,
    directives,
    selectionSet,
  }: {
    typeCondition: any;
    directives: any;
    selectionSet: any;
  }) =>
    join(
      ["...", wrap("on ", typeCondition), join(directives, " "), selectionSet],
      " ",
    ),

  FragmentDefinition: ({
    name,
    typeCondition,
    directives,
    selectionSet,
  }: {
    name: any;
    typeCondition: any;
    directives: any;
    selectionSet: any;
  }) =>
    `fragment ${name} on ${typeCondition} ` +
    wrap("", join(directives, " "), " ") +
    selectionSet,

  // Value

  IntValue: ({ value }: { value: any }) => value,
  FloatValue: ({ value }: { value: any }) => value,
  StringValue: ({ value }: { value: any }) => JSON.stringify(value),
  BooleanValue: ({ value }: { value: any }) => JSON.stringify(value),
  NullValue: () => "null",
  EnumValue: ({ value }: { value: any }) => value,
  ListValue: ({ values }: { values: any }) => "[" + join(values, ", ") + "]",
  ObjectValue: ({ fields }: { fields: any }) => "{" + join(fields, ", ") + "}",
  ObjectField: ({ name, value }: { name: any; value: any }) =>
    name + ": " + value,

  // Directive

  Directive: ({ name, arguments: args }: { name: any; arguments: any }) =>
    "@" + name + wrap("(", join(args, ", "), ")"),

  // Type

  NamedType: ({ name }: { name: any }) => name,
  ListType: ({ type }: { type: any }) => "[" + type + "]",
  NonNullType: ({ type }: { type: any }) => type + "!",

  // Type System Definitions

  SchemaDefinition: ({
    directives,
    operationTypes,
  }: {
    directives: any;
    operationTypes: any;
  }) => join(["schema", join(directives, " "), block(operationTypes)], " "),

  OperationTypeDefinition: ({
    operation,
    type,
  }: {
    operation: any;
    type: any;
  }) => operation + ": " + type,

  ScalarTypeDefinition: ({
    name,
    directives,
  }: {
    name: any;
    directives: any;
  }) => join(["scalar", name, join(directives, " ")], " "),

  ObjectTypeDefinition: ({
    name,
    interfaces,
    directives,
    fields,
  }: {
    name: any;
    interfaces: any;
    directives: any;
    fields: any;
  }) =>
    join(
      [
        "type",
        name,
        wrap("implements ", join(interfaces, ", ")),
        join(directives, " "),
        block(fields),
      ],
      " ",
    ),

  FieldDefinition: ({
    name,
    arguments: args,
    type,
    directives,
  }: {
    name: any;
    arguments: any;
    type: any;
    directives: any;
  }) =>
    name +
    wrap("(", join(args, ", "), ")") +
    ": " +
    type +
    wrap(" ", join(directives, " ")),

  InputValueDefinition: ({
    name,
    type,
    defaultValue,
    directives,
  }: {
    name: any;
    type: any;
    defaultValue: any;
    directives: any;
  }) =>
    join(
      [name + ": " + type, wrap("= ", defaultValue), join(directives, " ")],
      " ",
    ),

  InterfaceTypeDefinition: ({
    name,
    directives,
    fields,
  }: {
    name: any;
    directives: any;
    fields: any;
  }) => join(["interface", name, join(directives, " "), block(fields)], " "),

  UnionTypeDefinition: ({
    name,
    directives,
    types,
  }: {
    name: any;
    directives: any;
    types: any;
  }) =>
    join(
      ["union", name, join(directives, " "), "= " + join(types, " | ")],
      " ",
    ),

  EnumTypeDefinition: ({
    name,
    directives,
    values,
  }: {
    name: any;
    directives: any;
    values: any;
  }) => join(["enum", name, join(directives, " "), block(values)], " "),

  EnumValueDefinition: ({ name, directives }: { name: any; directives: any }) =>
    join([name, join(directives, " ")], " "),

  InputObjectTypeDefinition: ({
    name,
    directives,
    fields,
  }: {
    name: any;
    directives: any;
    fields: any;
  }) => join(["input", name, join(directives, " "), block(fields)], " "),

  TypeExtensionDefinition: ({ definition }: { definition: any }) =>
    `extend ${definition}`,

  DirectiveDefinition: ({
    name,
    arguments: args,
    locations,
  }: {
    name: any;
    arguments: any;
    locations: any;
  }) =>
    "directive @" +
    name +
    wrap("(", join(args, ", "), ")") +
    " on " +
    join(locations, " | "),

  Comment: ({ value }: { value: any }) => `# ${value.replace(/\n/g, "\n # ")}`,
};

/**
 * Given maybeArray, print an empty string if it is null or empty, otherwise
 * print all items together separated by separator if provided
 */
function join(maybeArray: any, separator?: any) {
  return maybeArray
    ? maybeArray.filter((x: any) => x).join(separator || "")
    : "";
}

/**
 * Given array, print each item on its own line, wrapped in an
 * indented "{ }" block.
 */
function block(array: any[]) {
  return array && array.length !== 0
    ? indent("{\n" + join(array, "\n")) + "\n}"
    : "{}";
}

/**
 * If maybeString is not null or empty, then wrap with start and end, otherwise
 * print an empty string.
 */
function wrap(start: any, maybeString: any, end?: any) {
  return maybeString ? start + maybeString + (end || "") : "";
}

function indent(maybeString: string) {
  return maybeString && maybeString.replace(/\n/g, "\n  ");
}
