import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Merchant, User } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class MerchantService {
  private mediaService: MediaService;

  /**
   * Initializes a new instance of the MerchantService class.
   * Sets up the mediaService for handling media-related operations.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Creates a new merchant.
   * @param merchant The merchant to be created.
   * @param file The file to be uploaded as the merchant's profile image.
   * @returns The created merchant.
   * @throws ResponseError if the user is not found, or if the market is not found when the market ID is provided.
   */
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

  /**
   * Adds images to a merchant.
   * @param merchantId The ID of the merchant to be updated.
   * @param files The files to be uploaded as images.
   * @returns The created media data.
   * @throws ResponseError if the merchant is not found or if no files exist.
   */
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

  /**
   * Retrieves all merchants.
   * @returns A Promise that resolves to an array of merchants, each with their
   * associated images and product count.
   */
  async getAllMerchants() {
    const merchants = await prisma.merchant.findMany();

    const images = await prisma.images.findMany({
      where: {
        type: "merchant",
        item_id: {
          in: merchants.map((merchant) => merchant.id),
        },
      },
    });

    const productCounts = await prisma.product.groupBy({
      by: ["merchant_id"],
      _count: {
        id: true,
      },
    });

    const productCountMap: Record<number, number> = productCounts.reduce(
      (acc, item) => {
        acc[item.merchant_id] = item._count.id;
        return acc;
      },
      {} as Record<number, number>
    );

    const merchantsWithDetails = merchants.map((merchant) => ({
      ...merchant,
      images: images.filter((image) => image.item_id === merchant.id),
      product_count: productCountMap[merchant.id] || 0,
    }));

    return merchantsWithDetails;
  }

  /**
   * Retrieves all merchants owned by the specified user, along with their associated images and product counts.
   * @param user - The user whose merchants are being retrieved.
   * @returns A Promise that resolves to an array of merchants owned by the user, each with an array of associated images
   * and a count of the products they offer.
   */
  async getAllMerchantsByOwner(user: User) {
    const merchants = await prisma.merchant.findMany({
      where: {
        user_id: user.id,
      },
    });

    const images = await prisma.images.findMany({
      where: {
        type: "merchant",
        item_id: {
          in: merchants.map((merchant) => merchant.id),
        },
      },
    });

    const productCounts = await prisma.product.groupBy({
      by: ["merchant_id"],
      _count: {
        id: true,
      },
    });

    const productCountMap: Record<number, number> = productCounts.reduce(
      (acc, item) => {
        acc[item.merchant_id] = item._count.id;
        return acc;
      },
      {} as Record<number, number>
    );

    const merchantsWithDetails = merchants.map((merchant) => ({
      ...merchant,
      images: images.filter((image) => image.item_id === merchant.id),
      product_count: productCountMap[merchant.id] || 0,
    }));

    return merchantsWithDetails;
  }

  /**
   * Retrieves a merchant by ID, along with associated images and product count.
   * @param id - The unique identifier of the merchant to retrieve.
   * @returns A Promise that resolves to an object containing the merchant, its
   * associated images, and the number of products it has.
   * @throws ResponseError if the merchant is not found.
   */
  async getMerchantById(id: number) {
    const merchant = await prisma.merchant.findUnique({
      where: {
        id,
      },
    });

    if (!merchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    const productCount = await prisma.product.count({
      where: {
        merchant_id: id,
      },
    });

    const images = await prisma.images.findMany({
      where: {
        type: "merchant",
        item_id: id,
      },
    });

    return {
      ...merchant,
      images,
      product_count: productCount,
    };
  }

  /**
   * Retrieves a merchant by its slug, along with associated images, products, and product images.
   * @param slug The slug of the merchant to retrieve.
   * @returns A Promise that resolves to an object containing the merchant, its associated images, and products with associated images.
   * @throws ResponseError if the merchant is not found.
   */
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

    const images = await prisma.images.findMany({
      where: {
        item_id: merchant.id,
        type: MediaType.MERCHANT,
      },
    });

    const productImages = await prisma.images.findMany({
      where: {
        type: MediaType.PRODUCT,
        item_id: {
          in: merchant.products.map((product) => product.id),
        },
      },
    });

    const productsWithImages = merchant.products.map((product) => {
      const imagesForProduct = productImages.filter(
        (image) => image.item_id === product.id
      );
      return {
        ...product,
        images: imagesForProduct,
      };
    });

    return {
      ...merchant,
      images: images,
      products: productsWithImages,
    };
  }

  /**
   * Retrieves a list of products for a specified merchant, including their categories and images.
   * @param id - The unique identifier of the merchant whose products are being retrieved.
   * @returns A Promise that resolves to an array of products, each with their associated categories and images.
   * Each product includes its categories and an array of image URLs.
   */
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

  /**
   * Updates a merchant by its ID.
   * @param merchant The merchant data to be updated.
   * @param file The file to be uploaded as the merchant's profile image.
   * @returns The updated merchant.
   * @throws ResponseError if the merchant or associated user/market is not found.
   */
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

  /**
   * Deletes a merchant by its ID.
   * @param id - The unique identifier of the merchant to be deleted.
   * @returns A Promise that resolves to the deleted merchant.
   * @throws ResponseError if the merchant is not found.
   */
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
