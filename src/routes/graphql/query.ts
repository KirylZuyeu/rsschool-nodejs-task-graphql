import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
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
      resolve: async (_parent, { id }: { id: string }, ctx) => {
        return ctx.prisma.memberType.findUnique({ where: { id: id } });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve: async (_parent, _args, ctx, info) => {
        const data = parseResolveInfo(info);
        const isIncludedSubscribedToUser = Object.keys(
          data?.fieldsByTypeName?.User ?? {},
        ).includes('subscribedToUser');
        const isIncludedUserSubscribedTo = Object.keys(
          data?.fieldsByTypeName?.User ?? {},
        ).includes('userSubscribedTo');

        const users = await ctx.prisma.user.findMany({
          include: {
            subscribedToUser: isIncludedSubscribedToUser,
            userSubscribedTo: isIncludedUserSubscribedTo,
          },
        });

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
            const authorIds = subscriber.userSubscribedTo.map(({ authorId }) => authorId);
            ctx.loaders.userSubscribedTo.prime(
              subscriber.id,
              users.filter((user) => authorIds.includes(user.id)),
            );
          });
        }

        return users;
      },
    },
    user: {
      type: UserType as GraphQLObjectType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }: { id: string }, ctx) => {
        return ctx.prisma.user.findUnique({
          where: {
            id,
          },
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
      resolve: async (_parent, { id }: { id: string }, ctx) => {
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
      resolve: async (_parent, { id }: { id: string }, ctx) => {
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
