import { GraphQLString, GraphQLInputObjectType, GraphQLBoolean} from 'graphql';

export const ChangePostInput = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: {
        title: {
            type: GraphQLString
        },
    }
});

export const ChangeProfileInput = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: {
        isMale: {
            type: GraphQLBoolean
        },
    }
});

export const ChangeUserInput = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: {
        name: {
            type: GraphQLString
        },
    }
});