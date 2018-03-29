import { AbyssalPlugin, Server, Request } from "@abyssal/core";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import * as merge from "deepmerge";
import * as globby from "globby";
import * as fs from "fs";
import * as path from "path";

import { IGraphQLPluginOptions } from "./interfaces";

export class GraphqlPlugin implements AbyssalPlugin {
  public options: IGraphQLPluginOptions;

  constructor(
    options: IGraphQLPluginOptions = {
      useGraphiql: false,
      resolvers: [],
      context: null,
    },
  ) {
    if (!options.schemaPath) {
      throw new Error("Please provide a path for .graphql schema");
    }
    this.options = options;
  }

  public init(app: Server) {
    const resolvers = merge.all(this.options.resolvers) as any;
    const typeDefs = this.getSchemas(this.options.schemaPath);

    const schema = mergeSchemas({
      schemas: typeDefs,
      resolvers,
    });

    app.use(
      "/graphql",
      graphqlExpress((req: Request) => ({
        schema,
        context:
          typeof this.options.context === "function"
            ? this.options.context(req)
            : this.options.context || {},
        formatError: (err: { [key: string]: any }) => {
          return { message: err.message };
        },
      })),
    );

    if (this.options.useGraphiql) {
      app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));
    }
  }

  private getSchemas(pattern: string): string[] {
    const schemas = globby
      .sync(pattern)
      .map(file => fs.readFileSync(file, { encoding: "utf8" }));
    return schemas;
  }
}
