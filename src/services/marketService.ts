import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Market } from "@prisma/client";

class MarketService {
  async createMarket(market: Market) {
    // make sure id is unique
    const existingMarket = await prisma.market.findFirst({
      where: {
        OR: [{ id: market.id }],
      },
    });

    if (existingMarket?.id === market.id)
      throw new ResponseError(409, "Market already exists");

    return prisma.market.create({
      data: {
        ...market,
      },
    });
  }

  async getAllMarkets() {
    return prisma.market.findMany();
  }

  async getMarketById(id: number) {
    const market = prisma.market.findUnique({
      where: {
        id,
      },
    });

    if (!market) {
      throw new ResponseError(404, "Market not found");
    }

    return market;
  }

  // async getUsersAdmin() {
  //   return prisma.user.findMany({
  //     where: {
  //       role: "ADMIN",
  //     },
  //   });
  // }

  // async getUserById(id: string) {
  //   const user = prisma.user.findUnique({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!user) {
  //     throw new ResponseError(404, "User not found");
  //   }

  //   return user;
  // }

  // async updateUser(user: User) {
  //   const existingUser = await prisma.user.findFirst({
  //     where: {
  //       id: user.id,
  //     },
  //   });

  //   if (!existingUser) {
  //     throw new ResponseError(404, "User not found");
  //   }

  //   return prisma.user.update({
  //     where: {
  //       id: user.id,
  //     },
  //     data: {
  //       ...user,
  //     },
  //   });
  // }

  // async deleteUserById(id: string) {
  //   const existingUser = await prisma.user.findFirst({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!existingUser) {
  //     throw new ResponseError(404, "User not found");
  //   }

  //   return prisma.user.delete({
  //     where: {
  //       id,
  //     },
  //   });
  // }
}

export default MarketService;
