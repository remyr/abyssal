import { GraphqlPlugin } from "@abyssal/plugin-graphql";

import { PostResolver } from "../resolvers";

export const graphqlPlugin = new GraphqlPlugin({
  schemaPath: "./**/*.graphql",
  useGraphiql: true,
  resolvers: [PostResolver],
});
