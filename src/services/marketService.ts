import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Market } from "@prisma/client";

class MarketService {
  async createMarket(market: Market) {
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

  async updateMarket(market: Market) {
    const existingMarket = await prisma.market.findFirst({
      where: {
        id: market.id,
      },
    });

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    return prisma.market.update({
      where: {
        id: market.id,
      },
      data: {
        ...market,
      },
    });
  }

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
