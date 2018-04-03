import { Request } from "@abyssaljs/core";

export interface IGraphqlResolver {
  Query?: object;
  Mutation?: object;
  Subscription?: object;
  [key: string]: object;
}

export interface IGraphQLPluginOptions {
  resolvers?: IGraphqlResolver[];
  useGraphiql?: boolean;
  schemaPath?: string;
  context?: (req: Request) => object | object;
}
