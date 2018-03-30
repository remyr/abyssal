const authors = [
  { id: 1, firstName: "Tom", lastName: "Coleman" },
  { id: 2, firstName: "Sashko", lastName: "Stubailo" },
  { id: 3, firstName: "Mikhail", lastName: "Novikov" },
];
const posts = [
  { id: 1, authorId: 1, title: "Introduction to GraphQL", votes: 2 },
  { id: 2, authorId: 2, title: "Welcome to Meteor", votes: 3 },
  { id: 3, authorId: 2, title: "Advanced GraphQL", votes: 1 },
  { id: 4, authorId: 3, title: "Launchpad is Cool", votes: 7 },
];

export const PostResolver = {
  Query: {
    posts: () => posts,
    author: (_: any, { id }: { id: any }) =>
      authors.filter((author: any) => author.id === id),
  },
  Mutation: {
    upvotePost: (_: any, { postId }: { postId: any }) => {
      const post = posts.filter((p: any) => p.id === postId);
      if (post.length === 0) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post[0].votes += 1;
      return post;
    },
  },
  Author: {
    posts: (author: any) =>
      posts.filter((post: any) => post.authorId === author.id),
  },
  Post: {
    author: (post: any) =>
      authors.filter((author: any) => author.id === post.authorId),
  },
};
