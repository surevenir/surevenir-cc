import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Merchant, Prisma } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

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

    if (merchant.market_id) {
      const existingMarket = await prisma.market.findFirst({
        where: {
          id: merchant.market_id ?? undefined,
        },
      });

      if (!existingMarket) {
        throw new ResponseError(404, "Market not found");
      }
    }

    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      merchant.profile_image_url = mediaUrl;
    }

    return await prisma.merchant.create({
      data: merchant,
    });
  }

  async addMerchantImages(merchantId: number, files: Express.Request["files"]) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: merchantId,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    if (!files || (files as any).length === 0) {
      throw new ResponseError(400, "No files exist");
    }

    const mediaUrls = await Promise.all(
      (files as any).map((file: any) => this.mediaService.uploadMedia(file))
    );

    const mediaData: MediaData[] = mediaUrls.map((mediaUrl) => ({
      url: mediaUrl,
      itemId: merchantId,
      type: MediaType.MERCHANT,
    }));

    await this.mediaService.saveMedias(mediaData);

    return mediaData;
  }

  async getAllMerchants() {
    const merchants = await prisma.merchant.findMany();

    const images = await prisma.images.findMany({
      where: {
        type: "merchant",
        item_id: {
          in: merchants.map((market) => market.id),
        },
      },
    });

    const merchantsWithImages = merchants.map((market) => ({
      ...market,
      images: images.filter((image) => image.item_id === market.id),
    }));

    return merchantsWithImages;
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

  async getMerchantBySlug(slug: string) {
    const merchant = await prisma.merchant.findFirst({
      where: {
        slug,
      },
      include: {
        products: true,
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

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: merchant.user_id,
      },
    });

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    if (merchant.market_id) {
      const existingMarket = await prisma.market.findFirst({
        where: {
          id: merchant.market_id ?? undefined,
        },
      });

      if (!existingMarket) {
        throw new ResponseError(404, "Market not found");
      }
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

    try {
      await this.mediaService.deleteMediaForItem(id, MediaType.MERCHANT);
      if (existingMerchant.profile_image_url) {
        await this.mediaService.deleteMediaFromGCSByUrl(
          existingMerchant.profile_image_url
        );
      }

      console.log("Media for merchant deleted successfully.");
    } catch (error) {
      console.error("Error deleting media for merchant:", error);
      throw new ResponseError(500, "Failed to delete media for merchant");
    }

    try {
      const deletedMerchant = await prisma.merchant.delete({
        where: {
          id,
        },
      });
      console.log("Merchant deleted successfully:", deletedMerchant);
      return deletedMerchant;
    } catch (error) {
      console.error("Error deleting merchant:", error);
      throw new ResponseError(500, "Failed to delete merchant");
    }
  }
}

export default MerchantService;
