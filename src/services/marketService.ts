import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Market } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class MarketService {
  private mediaService: MediaService;

  /**
   * Initializes a new instance of the MarketService class.
   * Sets up the mediaService for handling media-related operations.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Creates a new market.
   * @param market The market to be created.
   * @param file The file to be uploaded as the market's profile image.
   * @returns The created market.
   */
  async createMarket(market: Market, file: Express.Request["file"]) {
    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      market.profile_image_url = mediaUrl;
    }

    return await prisma.market.create({
      data: market,
    });
  }

  /**
   * Adds images to a market.
   * @param marketId The ID of the market to be updated.
   * @param files The files to be uploaded as images.
   * @returns The created media data.
   */
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

  /**
   * Retrieves all markets along with their associated images.
   * @returns A Promise that resolves to an array of markets, each with an array of associated images.
   */
  async getAllMarkets() {
    const markets = await prisma.market.findMany();

    const images = await prisma.images.findMany({
      where: {
        type: "market",
        item_id: {
          in: markets.map((market) => market.id),
        },
      },
    });

    const marketsWithImages = markets.map((market) => ({
      ...market,
      images: images.filter((image) => image.item_id === market.id),
    }));

    return marketsWithImages;
  }

  /**
   * Retrieves a market by its ID along with associated images.
   * @param id - The unique identifier of the market to retrieve.
   * @returns A Promise that resolves to an object containing the market and its images.
   * @throws ResponseError if the market is not found.
   */
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

  /**
   * Retrieves a market by its slug along with associated images and merchants.
   * @param slug The slug of the market to retrieve.
   * @returns A Promise that resolves to an object containing the market, its images, and its merchants.
   * @throws ResponseError if the market is not found.
   */
  async getMarketBySlug(slug: string) {
    const market = await prisma.market.findFirst({
      where: {
        slug,
      },
      include: {
        merchants: true,
      },
    });

    if (!market) {
      throw new ResponseError(404, "Market not found");
    }

    const images = await prisma.images.findMany({
      where: {
        item_id: market.id,
        type: MediaType.MARKET,
      },
    });

    return {
      ...market,
      images,
    };
  }

  /**
   * Retrieves a list of merchants in a specified market.
   * @param id - The unique identifier of the market.
   * @returns A Promise that resolves to an array of merchants in the specified market.
   */
  async getMerchantsInMarket(id: number) {
    return await prisma.merchant.findMany({
      where: {
        market_id: id,
      },
    });
  }

  /**
   * Updates a market by its ID.
   * @param market The market with the values to be updated.
   * @param file The file to be uploaded as the market's profile image.
   * @returns The updated market.
   * @throws ResponseError if the market is not found.
   */
  async updateMarket(market: Market, file: Express.Multer.File | undefined) {
    const existingMarket = await prisma.market.findFirst({
      where: {
        id: market.id,
      },
    });

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    if (file) {
      const newUrl = await this.mediaService.updateMedia(
        file,
        market.profile_image_url!
      );
      console.log(newUrl);

      market.profile_image_url = newUrl;
    }

    return await prisma.market.update({
      where: {
        id: market.id,
      },
      data: market,
    });
  }

  /**
   * Deletes a market by its ID.
   * @param id - The unique identifier of the market to be deleted.
   * @returns A Promise that resolves to the deleted market.
   * @throws ResponseError if the market is not found.
   */
  async deleteMarketById(id: number) {
    const existingMarket = await prisma.market.findFirst({
      where: {
        id,
      },
    });

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    try {
      await this.mediaService.deleteMediaForItem(id, MediaType.MARKET);
      if (existingMarket.profile_image_url) {
        await this.mediaService.deleteMediaFromGCSByUrl(
          existingMarket.profile_image_url
        );
      }

      console.log("Media for market deleted successfully.");
    } catch (error) {
      console.error("Error deleting media for market:", error);
      throw new ResponseError(500, "Failed to delete media for market");
    }

    try {
      const deletedMarket = await prisma.market.delete({
        where: {
          id,
        },
      });
      console.log("Market deleted successfully:", deletedMarket);
      return deletedMarket;
    } catch (error) {
      console.error("Error deleting market:", error);
      throw new ResponseError(500, "Failed to delete market");
    }
  }
}

export default MarketService;
