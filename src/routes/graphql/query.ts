import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
} from 'graphql';
import {
  MemberType,
  MemberTypeId,
  PostType,
  ProfileType,
  UserType,
} from './graphql-model.js';
import { UUIDType } from './types/uuid.js';
import { GraphQLContext } from './model.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { User } from '@prisma/client';

const getIncludedFields = (info: GraphQLResolveInfo) => {
  const parsedInfo = parseResolveInfo(info);
  const userFields = parsedInfo?.fieldsByTypeName?.User ?? {};

  const isIncludedSubscribedToUser = Object.keys(userFields).includes(
    'subscribedToUser',
  );
  const isIncludedUserSubscribedTo = Object.keys(userFields).includes(
    'userSubscribedTo',
  );

  return { isIncludedSubscribedToUser, isIncludedUserSubscribedTo };
};

type UserWithConnections = User & {
  subscribedToUser: { subscriberId: string }[];
  userSubscribedTo: { authorId: string }[];
};

const primeUserConnections = (
  users: UserWithConnections[],
  ctx: GraphQLContext,
  isIncludedSubscribedToUser: boolean,
  isIncludedUserSubscribedTo: boolean,
) => {
  if (isIncludedSubscribedToUser) {
    users.forEach((author) => {
      const subscriberIds = author.subscribedToUser.map(
        ({ subscriberId }) => subscriberId,
      );
      ctx.loaders.subscribedToUser.prime(
        author.id,
        users.filter((user) => subscriberIds.includes(user.id)),
      );
    });
  }

  if (isIncludedUserSubscribedTo) {
    users.forEach((subscriber) => {
      const authorIds = subscriber.userSubscribedTo.map(
        ({ authorId }) => authorId,
      );
      ctx.loaders.userSubscribedTo.prime(
        subscriber.id,
        users.filter((user) => authorIds.includes(user.id)),
      );
    });
  }
};

export const RootQueryType = new GraphQLObjectType<unknown, GraphQLContext>({
  name: 'Query',
  fields: () => ({
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_parent, _args, ctx) => {
        return ctx.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_parent, { id }, ctx) => {
        return ctx.prisma.memberType.findUnique({ where: { id } });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_parent, _args, ctx, info) => {
        const { isIncludedSubscribedToUser, isIncludedUserSubscribedTo } =
          getIncludedFields(info);

        const users = (await ctx.prisma.user.findMany({
          include: {
            subscribedToUser: isIncludedSubscribedToUser,
            userSubscribedTo: isIncludedUserSubscribedTo,
          },
        })) as UserWithConnections[]; // Утверждение типа для удобства

        primeUserConnections(
          users,
          ctx,
          isIncludedSubscribedToUser,
          isIncludedUserSubscribedTo,
        );

        return users;
      },
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }, ctx) => {
        return ctx.prisma.user.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve: async (_parent, _args, ctx) => {
        return ctx.prisma.post.findMany({
          include: {
            author: true,
          },
        });
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }, ctx) => {
        return ctx.prisma.post.findUnique({
          where: { id },
          include: {
            author: true,
          },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve: async (_parent, _args, ctx) => {
        return ctx.prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }, ctx) => {
        return ctx.prisma.profile.findUnique({
          where: { id },
          include: {
            memberType: true,
          },
        });
      },
    },
  }),
});
