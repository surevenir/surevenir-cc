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

  async getMerchantsInMarket(id: number) {
    return prisma.merchant.findMany({
      where: {
        market_id: id,
      },
    });
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
        updatedAt: new Date(),
      },
    });
  }

  async deleteMarketById(id: number) {
    const existingMarket = await prisma.market.findFirst({
      where: {
        id,
      },
    });

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    return prisma.market.delete({
      where: {
        id,
      },
    });
  }
}

export default MarketService;
