import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Merchant } from "@prisma/client";
import MediaService from "./mediaService";

class MerchantService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createMerchant(merchant: Merchant, file: Express.Request["file"]) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: merchant.user_id,
      },
    });

    const existingMarket = await prisma.market.findFirst({
      where: {
        id: merchant.market_id,
      },
    });

    if (!existingUser && !existingMarket) {
      throw new ResponseError(404, "User and market not found");
    }

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      merchant.profile_image_url = mediaUrl;
    }

    return prisma.merchant.create({
      data: merchant,
    });
  }

  async getAllMerchants() {
    const merchant = await prisma.merchant.findMany();
  }

  async getMerchantById(id: number) {
    const merchant = prisma.merchant.findUnique({
      where: {
        id,
      },
    });

    if (!merchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    return merchant;
  }

  async getProductsInMerchant(id: number) {
    return prisma.product.findMany({
      where: {
        merchant_id: id,
      },
    });
  }

  async updateMerchant(merchant: Merchant, file: Express.Request["file"]) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: merchant.id,
      },
    });

    const existingUser = await prisma.user.findFirst({
      where: {
        id: merchant.user_id,
      },
    });

    const existingMarket = await prisma.market.findFirst({
      where: {
        id: merchant.market_id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    if (!existingUser && !existingMarket) {
      throw new ResponseError(404, "User and market not found");
    }

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      merchant.profile_image_url = mediaUrl;
    }

    return prisma.merchant.update({
      where: {
        id: merchant.id,
      },
      data: merchant,
    });
  }

  async deleteMerchantById(id: number) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    return prisma.merchant.delete({
      where: {
        id,
      },
    });
  }
}

export default MerchantService;
