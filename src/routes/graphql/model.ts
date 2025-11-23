import { MemberType, Post, PrismaClient, Profile } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { MemberTypeId } from '../member-types/schemas.js';
import DataLoader from 'dataloader';
import { UserType } from './graphql-model.js';

export interface GraphQLContext {
  prisma: PrismaClient;
  request: FastifyRequest;
  loaders: {
    userSubscribedTo: DataLoader<unknown, typeof UserType>;
    subscribedToUser: DataLoader<unknown, typeof UserType>;
    memberType: DataLoader<unknown, MemberType>;
    posts: DataLoader<unknown, Post>;
    profile: DataLoader<unknown, Profile>;
  };
}

export interface CreatePostDto {
  title: string;
  content: string;
  authorId: string;
}

export interface CreateUserDto {
  name: string;
  balance: number;
}

export interface CreateProfileDto {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: MemberTypeId;
}
