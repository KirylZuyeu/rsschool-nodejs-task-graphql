import {
  MemberType,
  Post,
  PrismaClient,
  Profile,
  User,
  SubscribersOnAuthors, // Добавлен для полной типизации
} from '@prisma/client';
import { FastifyRequest } from 'fastify';
import DataLoader from 'dataloader';
import { MemberTypeId } from '../member-types/schemas.js';


export interface GraphQLContext {
  prisma: PrismaClient;
  request: FastifyRequest;
  loaders: {

    subscribedToUser: DataLoader<string, User[]>;

    userSubscribedTo: DataLoader<string, User[]>;

    memberType: DataLoader<number | string, MemberType>;

    posts: DataLoader<string, Post>;

    profile: DataLoader<string, Profile>;

    profileByUserId: DataLoader<string, Profile>;
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
