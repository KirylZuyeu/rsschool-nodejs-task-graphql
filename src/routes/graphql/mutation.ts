import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
  PostType,
  ProfileType,
  UserType,
} from './graphql-model.js';
import {
  CreatePostDto,
  CreateProfileDto,
  CreateUserDto,
  GraphQLContext,
} from './model.js';
import { Post, Profile, User } from '@prisma/client';
import { UUIDType } from './types/uuid.js';

type CreateArgs<T> = {
  dto: T;
};

type ChangeArgs<T extends { id: string }, D> = {
  id: T['id'];
  dto: D;
};

type DeleteArgs<T extends { id: string }> = {
  id: T['id'];
};

type SubscriptionArgs = {
  userId: User['id'];
  authorId: User['id'];
};

// --- Объект GraphQL Mutation ---

export const MutationType = new GraphQLObjectType<unknown, GraphQLContext>({
  name: 'Mutation',
  fields: {
    // --- User Mutations ---
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (
        _source,
        { dto }: CreateArgs<CreateUserDto>,
        ctx,
      ) => {
        return await ctx.prisma.user.create({ data: dto });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (
        _source,
        { id, dto }: ChangeArgs<User, Omit<User, 'id'>>,
        ctx,
      ) => {
        return await ctx.prisma.user.update({ where: { id }, data: dto });
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: DeleteArgs<User>, ctx) => {
        await ctx.prisma.user.delete({ where: { id } });
        return `User with id ${id} successfully deleted.`;
      },
    },

    // --- Profile Mutations ---
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (
        _source,
        { dto }: CreateArgs<CreateProfileDto>,
        ctx,
      ) => {
        return await ctx.prisma.profile.create({ data: dto });
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (
        _source,
        { id, dto }: ChangeArgs<Profile, Omit<Profile, 'id' | 'userId'>>,
        ctx,
      ) => {
        return await ctx.prisma.profile.update({ where: { id }, data: dto });
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: DeleteArgs<Profile>, ctx) => {
        await ctx.prisma.profile.delete({ where: { id } });
        return `Profile with id ${id} successfully deleted.`;
      },
    },

    // --- Post Mutations ---
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (
        _source,
        { dto }: CreateArgs<CreatePostDto>,
        ctx,
      ) => {
        return await ctx.prisma.post.create({ data: dto });
      },
    },
    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (
        _source,
        { id, dto }: ChangeArgs<Post, Omit<Post, 'id'>>,
        ctx,
      ) => {
        return await ctx.prisma.post.update({
          where: { id },
          data: dto,
          include: {
            author: true,
          },
        });
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: DeleteArgs<Post>, ctx) => {
        await ctx.prisma.post.delete({ where: { id } });
        return `Post with id ${id} successfully deleted.`;
      },
    },

    // --- Subscription Mutations ---
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _source,
        { userId, authorId }: SubscriptionArgs,
        ctx,
      ) => {
        await ctx.prisma.subscribersOnAuthors.create({
          data: { subscriberId: userId, authorId },
        });
        return `User with id ${userId} subscribed to author with id ${authorId}.`;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _source,
        { userId, authorId }: SubscriptionArgs,
        ctx,
      ) => {
        await ctx.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              authorId,
              subscriberId: userId,
            },
          },
        });
        return `User with id ${userId} unsubscribed from author with id ${authorId}.`;
      },
    },
  },
});
