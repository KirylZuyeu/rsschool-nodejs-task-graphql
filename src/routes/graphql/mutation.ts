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

export const MutationType = new GraphQLObjectType<unknown, GraphQLContext>({
  name: 'Mutation',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (_source, args: Record<string, object>, ctx) => {
        return await ctx.prisma.user.create({ data: args.dto as CreateUserDto });
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
        { id, dto }: { id: User['id']; dto: Omit<User, 'id'> },
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
      resolve: async (_source, { id }: { id: User['id'] }, ctx) => {
        await ctx.prisma.user.delete({ where: { id } });
        return `User with id ${id} successfully deleted`;
      },
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (_source, args: Record<string, object>, ctx) => {
        return await ctx.prisma.profile.create({ data: args.dto as CreateProfileDto });
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
        { id, dto }: { id: Profile['id']; dto: Omit<Profile, 'id' | 'userId'> },
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
      resolve: async (_source, { id }: { id: Profile['id'] }, ctx) => {
        await ctx.prisma.profile.delete({ where: { id } });
        return `Porfile with id ${id} successfully deleted`;
      },
    },
    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (_source, args: Record<string, object>, ctx) => {
        return await ctx.prisma.post.create({ data: args.dto as CreatePostDto });
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
        { id, dto }: { id: Post['id']; dto: Omit<Post, 'id'> },
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
      resolve: async (_source, { id }: { id: Post['id'] }, ctx) => {
        await ctx.prisma.post.delete({ where: { id } });
        return `Post with id ${id} successfully deleted`;
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _source,
        { userId, authorId }: { userId: User['id']; authorId: User['id'] },
        ctx,
      ) => {
        await ctx.prisma.subscribersOnAuthors.create({
          data: { subscriberId: userId, authorId },
        });
        return `User with id ${userId} subscibed to author with id ${authorId}`;
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
        { userId, authorId }: { userId: User['id']; authorId: User['id'] },
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
        return `User with id ${userId} unsubscibed from author with id ${authorId}`;
      },
    },
  },
});
