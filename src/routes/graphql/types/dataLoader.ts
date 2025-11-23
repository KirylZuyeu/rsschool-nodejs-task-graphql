/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import DataLoader from "dataloader";
import { FastifyInstance } from "fastify";

export const createLoaders = async (fastify: FastifyInstance) => {

    const batchGetPostsByAutorId = async (ids: any) => {
      const posts = await fastify.prisma.post.findMany({
        where: {
          authorId: { in: ids },
        }
      });
      const res = ids.map((id: string) => posts.filter((post) => post.authorId === id) || null);
      return res;
    };
    
    const batchGetProfilesByAutorId = async (ids: any) => {
      const profiles = await fastify.prisma.profile.findMany({
        where: {
          userId: { in: ids },
        }
      });

      const res = ids.map((id: string) => profiles.find((profile) => profile.userId === id) || null);
      return res;
    }

    const batchGetProfilesById = async (ids: any) => {
        const profileRes = await fastify.prisma.profile.findMany({
          where: {
            id: { in: ids },
          }
        });

        const res = ids.map((id: string) => profileRes.find((profile) => profile.id === id) || null);
        return res;
    }

    const batchGetMemberTypesByAutorId = async (ids: any) => {
      const memberTypes = await fastify.prisma.memberType.findMany({
        where: {
          id: { in: ids },
        }
      });
      const res = ids.map((id: string) => memberTypes.find((memberType) => memberType.id === id) || null);
      return res;
    }
  
    const postsDataloader = new DataLoader(batchGetPostsByAutorId);
    const profilesDataloader = new DataLoader(batchGetProfilesByAutorId);
    const profilesByIdDataloader = new DataLoader(batchGetProfilesById);
    const memberTypesDataloader = new DataLoader(batchGetMemberTypesByAutorId);

    return { postsDataloader, profilesDataloader, profilesByIdDataloader, memberTypesDataloader };
  }