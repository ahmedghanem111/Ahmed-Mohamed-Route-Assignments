import { ApolloServer } from "@apollo/server";
import { decodeToken, TokenEnum } from "../middleware/auth.middleware.js";

const typeDefs = `#graphql

  type User {
    id: ID!
    name: String!
    email: String!
    bio: String
    age: Int
    isOnline: Boolean
    isActive: Boolean
    gender: Int
    provider: Int
    role: Int
    profilePic: String
    coverPics: [String!]
  }

  type FriendRequest {
    id: ID!
    status: Int!
    from: User!
    to: User!
  }

  type Query {
    listFriendRequests(isTo: Boolean): [FriendRequest!]!
    listFriends: [FriendRequest!]!
  }

  type Mutation {
    sendFriendRequest(to: ID!): Boolean!
    replyToFriendRequest(id: ID!, status: Int!): Boolean!
    cancelFriendRequest(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {

    listFriendRequests: async (
      _: unknown,
      { isTo = true }: { isTo?: boolean },
      context: { user: any }
    ) => {

      const { listFriendRequests } =
        await import("../modules/user/user.services.js");

      const { data } = await listFriendRequests({
        userId: context.user._id,
        isTo
      });

      return data.friendRequests;
    },

    listFriends: async (
      _: unknown,
      __: unknown,
      context: { user: any }
    ) => {

      const { listFriend } =
        await import("../modules/user/user.services.js");

      const { data } = await listFriend({
        user: context.user
      });

      return data.friends;
    }

  },

  Mutation: {

    sendFriendRequest: async (
      _: unknown,
      { to }: { to: string },
      context: { user: any }
    ) => {

      const { sendFriendRequest } =
        await import("../modules/user/user.services.js");

      await sendFriendRequest({
        to,
        from: context.user._id.toString()
      });

      return true;
    },

    replyToFriendRequest: async (
      _: unknown,
      { id, status }: { id: string; status: number },
      context: { user: any }
    ) => {

      const { friendRequestReply } =
        await import("../modules/user/user.services.js");

      await friendRequestReply({
        id,
        status,
        userId: context.user._id.toString()
      });

      return true;
    },

    cancelFriendRequest: async (
      _: unknown,
      { id }: { id: string },
      context: { user: any }
    ) => {

      const { cancelFriendRequest } =
        await import("../modules/user/user.services.js");

      await cancelFriendRequest({
        id,
        userId: context.user._id.toString()
      });

      return true;
    }

  },

  User: {
    id: (user: any) => user._id.toString()
  },

  FriendRequest: {
    id: (friendRequest: any) => friendRequest._id.toString()
  }
};

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

export const getGraphQLContext = async (authorization: string | undefined) => {
    const { user } = await decodeToken({
        authorization: authorization as string,
        tokenType: TokenEnum.access
    });

    return {
        user
    };
};