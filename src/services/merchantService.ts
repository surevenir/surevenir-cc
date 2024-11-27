import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Merchant, Prisma } from "@prisma/client";
import MediaService, { MediaType } from "./mediaService";

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

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    const existingMarket = await prisma.market.findFirst({
      where: {
        id: merchant.market_id ?? undefined,
      },
    });

    if (!existingMarket) {
      throw new ResponseError(404, "Market not found");
    }

    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      merchant.profile_image_url = mediaUrl;
    }

    return await prisma.merchant.create({
      data: merchant,
    });
  }

  async getAllMerchants() {
    let merchants = await prisma.merchant.findMany({
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    merchants = merchants.map((merchant: any) => {
      merchant.products_count = merchant.products.length;
      delete merchant.products;
      return merchant;
    });

    return merchants;
  }

  async getMerchantById(id: number) {
    const merchant = await prisma.merchant.findUnique({
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
    let products = await prisma.product.findMany({
      where: {
        merchant_id: id,
      },
      include: {
        product_categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const imagesUrl = await prisma.images.findMany({
      where: {
        item_id: {
          in: products.map((product) => product.id),
        },
        type: MediaType.PRODUCT,
      },
    });

    products = products.map((product) => ({
      ...product,
      images: imagesUrl.filter((image) => image.item_id === product.id),
    }));

    return products;
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
        id: merchant.market_id ?? undefined,
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

    return await prisma.merchant.update({
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

    return await prisma.merchant.delete({
      where: {
        id,
      },
    });
  }
}

export default MerchantService;
