import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';

export const createMemberTypeLoader = (prisma: PrismaClient) =>
  new DataLoader<string, MemberType>(async (memberTypeIds) => {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        id: {
          in: [...memberTypeIds],
        },
      },
    });

    const map: Record<string, MemberType> = {};
    memberTypes.forEach((m) => {
      map[m.id] = m;
    });

    return memberTypeIds.map((id) => map[id]);
  });

export const createProfileLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Profile>(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          in: [...userIds],
        },
      },
      include: {
        memberType: true,
      },
    });

    const map: Record<string, Profile> = {};
    profiles.forEach((p) => {
      map[p.userId] = p;
    });

    return userIds.map((id) => map[id] ?? null);
  });

export const createPostsLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Post[]>(async (userIds) => {
    const relatedPosts = await prisma.post.findMany({
      where: {
        authorId: {
          in: [...userIds],
        },
      },
    });

    const map: Record<string, Post[]> = {};
    relatedPosts.forEach((post) => {
      map[post.authorId] ? map[post.authorId].push(post) : (map[post.authorId] = [post]);
    });

    return userIds.map((id) => map[id] ?? []);
  });

export const createUserSubscribedToLoader = (prisma: PrismaClient) =>
  new DataLoader<string, User[]>(async (subscriberIds) => {
    const links = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: subscriberIds as string[] } },
      include: { author: true },
    });

    const map: Record<string, User[]> = {};
    links.forEach((link) => {
      map[link.subscriberId]
        ? map[link.subscriberId].push(link.author)
        : (map[link.subscriberId] = [link.author]);
    });

    return subscriberIds.map((id) => map[id] ?? []);
  });

export const createSubscribedToUserLoader = (prisma: PrismaClient) =>
  new DataLoader<string, User[]>(async (authorIds) => {
    const links = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: [...authorIds] } },
      include: { subscriber: true },
    });

    const map: Record<string, User[]> = {};
    links.forEach((l) => {
      map[l.authorId]
        ? map[l.authorId].push(l.subscriber)
        : (map[l.authorId] = [l.subscriber]);
    });

    return authorIds.map((id) => map[id] ?? []);
  });
