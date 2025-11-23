import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { GraphQLError, GraphQLSchema, parse, validate, graphql } from 'graphql';
import { createLoaders } from './types/dataLoader.js';
import depthLimit from 'graphql-depth-limit';

export const depthLimitValidate = (query: string, schema: GraphQLSchema, dLimit: number): GraphQLError | null => {
  const document = parse(query);
  const validationErrors = validate(schema, document, [depthLimit(dLimit)]);
  const resError = validationErrors.find(
    (error) => error.name === 'GraphQLError' && error.message.includes('exceeds maximum operation depth')
  ) || null;
  return resError;
};

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { postsDataloader, memberTypesDataloader, profilesByIdDataloader, profilesDataloader } = await createLoaders(fastify);

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const queryStr = req.body?.query;
      const variablesStr = req.body?.variables;
      const MAX_QUERY_DEPTH = 5;

      const depthQueryError = depthLimitValidate(queryStr, schema, MAX_QUERY_DEPTH);

      if(depthQueryError) {
        const message = `exceeds maximum operation depth of ${ MAX_QUERY_DEPTH }`
        return {
          errors: [
            {
              message: message,
            },
          ],
        }
      }

      const res = await graphql({
        schema: schema,
        source: queryStr,
        variableValues: variablesStr,
        contextValue: {
          fastify,
          postsDataloader,
          profilesDataloader,
          profilesByIdDataloader,
          memberTypesDataloader
        },
      });

      return { ...res };
    },
  });
};

export default plugin;
