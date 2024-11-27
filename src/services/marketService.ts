import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Market } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class MarketService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createMarket(market: Market) {
    return prisma.market.create({
      data: market,
    });
  }

  async addMarketImages(marketId: number, files: Express.Request["files"]) {
    const existingMarket = await prisma.market.findFirst({
      where: {
        id: marketId,
      },
    });

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    if (!files || (files as any).length === 0) {
      throw new ResponseError(400, "No files exist");
    }

    const mediaUrls = await Promise.all(
      (files as any).map((file: any) => this.mediaService.uploadMedia(file))
    );

    const mediaData: MediaData[] = mediaUrls.map((mediaUrl) => ({
      url: mediaUrl,
      itemId: marketId,
      type: MediaType.MARKET,
    }));

    await this.mediaService.saveMedias(mediaData);

    return mediaData;
  }

  async getAllMarkets() {
    return await prisma.market.findMany();
  }

  async getMarketById(id: number) {
    const market = await prisma.market.findUnique({
      where: {
        id,
      },
    });

    if (!market) {
      throw new ResponseError(404, "Market not found");
    }

    const images = await prisma.images.findMany({
      where: {
        item_id: id,
        type: MediaType.MARKET,
      },
    });

    return {
      ...market,
      images,
    };
  }

  async getMerchantsInMarket(id: number) {
    return await prisma.merchant.findMany({
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

    return await prisma.market.update({
      where: {
        id: market.id,
      },
      data: market,
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

    return await prisma.market.delete({
      where: {
        id,
      },
    });
  }
}

export default MarketService;
