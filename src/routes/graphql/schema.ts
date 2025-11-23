import { GraphQLSchema } from 'graphql';
import { RootQueryType } from './query.js';
import { MutationType } from './mutation.js';
import {
  CreatePostInput,
  CreateUserInput,
  MemberType,
  PostType,
  ProfileType,
  UserType,
} from './graphql-model.js';

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType,
  types: [UserType, CreateUserInput, PostType, CreatePostInput, ProfileType, MemberType],
});
