import { AbyssalPlugin, Server, Request } from "@abyssaljs/core";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import * as merge from "deepmerge";
import * as globby from "globby";
import * as fs from "fs";
import * as path from "path";

import { mergeTypes } from "./merge-schemas";
import { IGraphQLPluginOptions } from "./interfaces";

export class GraphqlPlugin implements AbyssalPlugin {
  public options: IGraphQLPluginOptions;

  constructor(
    options: IGraphQLPluginOptions = {
      useGraphiql: false,
      resolvers: [],
      context: null,
      formatError: (err: { [key: string]: any }) => {
        return { message: err.message };
      },
    },
  ) {
    if (!options.schemaPath) {
      throw new Error("Please provide a path for .graphql schema");
    }
    this.options = options;
  }

  public init(app: Server) {
    const schema = this.getExecutableSchemas();

    app.use(
      "/graphql",
      graphqlExpress((req: Request) => ({
        schema,
        context:
          typeof this.options.context === "function"
            ? this.options.context(req)
            : this.options.context || {},
        formatError: this.options.formatError,
      })),
    );

    if (this.options.useGraphiql) {
      app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));
    }
  }

  public getExecutableSchemas(): GraphQLSchema {
    const resolvers = merge.all(this.options.resolvers) as any;
    const typeDefs = mergeTypes(this.getSchemas(this.options.schemaPath), {
      all: true,
    });

    return makeExecutableSchema({ typeDefs, resolvers });
  }

  private getSchemas(pattern: string): string[] {
    const schemas = globby
      .sync(pattern)
      .map(file => fs.readFileSync(file, { encoding: "utf8" }));
    return schemas;
  }
}
