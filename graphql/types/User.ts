import { enumType, intArg, objectType, stringArg } from "nexus";
import { extendType } from "nexus";
import { Link } from "./Link";

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("email");
    t.string("image");
    t.field("role", { type: Role });
    t.list.field("bookmarks", {
      type: "Link",
      async resolve(_parent, _args, ctx) {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: _parent.id,
          },
          include: {
            bookmarks: true,
          },
        });
        return user && user.bookmarks ? user.bookmarks : [];
      },
    });
  },
});

const Role = enumType({
  name: "Role",
  members: ["USER", "ADMIN"],
});

export const UserFavorites = extendType({
  type: "Query",
  definition(t) {
    t.list.field("bookmarks", {
      type: "Link",
      async resolve(_, _args, ctx) {
        const user = await ctx.prisma.user.findUnique({
          where: {
            email: ctx.user.email,
          },
          include: {
            bookmarks: true,
          },
        });
        if (!user) throw new Error("Invalid user");
        return user && user.bookmarks ? user.bookmarks : [];
      },
    });
  },
});

export const BookmarkLink = extendType({
  type: "Mutation",
  definition(t) {
    t.field("bookmarkLink", {
      type: "Link",
      args: {
        id: intArg(),
      },
      async resolve(_, args, ctx) {
        const link = await ctx.prisma.link.findUnique({
          where: { id: args.id },
        });

        await ctx.prisma.user.update({
          where: {
            email: ctx.user.email,
          },
          data: {
            bookmarks: {
              connect: {
                id: link.id,
              },
            },
          },
        });
        return link;
      },
    });
  },
});
