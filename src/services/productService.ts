import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Product } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class ProductService {
  mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createProduct(product: Product, files: Express.Request["files"]) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: product.merchant_id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    await this.uploadAndSaveMediasIfExist(files, product.id);

    return prisma.product.create({
      data: {
        ...product,
      },
    });
  }

  async getAllProducts() {
    return prisma.product.findMany();
  }

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            market: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        product_categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }
      }
    });

    const imagesUrl = await prisma.images.findMany({
      where: {
        item_id: id,
        type: MediaType.PRODUCT,
      },
    });

    if (!product) {
      throw new ResponseError(404, "Product not found");
    }

    return {
      ...product,
      images: imagesUrl.map((image) => image.url),
    }
  }

  async getProductByQuery(sort_by: string, category: string) {
    const sortOptions: Record<
      string,
      { column: string; direction: "asc" | "desc" }
    > = {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
      price_asc: { column: "price", direction: "asc" },
      price_desc: { column: "price", direction: "desc" },
      popular: { column: "popularity", direction: "desc" },
    };

    const sortOption = sortOptions[sort_by] || sortOptions.newest;

    const products = await prisma.product.findMany({
      where:
        category !== "all"
          ? {
              product_categories: {
                some: {
                  category: {
                    name: category,
                  },
                },
              },
            }
          : undefined,
      orderBy: { [sortOption.column]: sortOption.direction },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            market: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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

    return products;
  }

  async getProductWithReviews(id: number) {
    const productWithReviews = await prisma.product.findUnique({
      where: { id: id },
      include: {
        reviews: {
          include: {
            user: true, // Mengambil detail user jika diperlukan
          },
        },
      },
    });

    if (!productWithReviews) {
      throw new ResponseError(404, "Product not found");
    }

    return productWithReviews;
  }

  async updateProduct(product: Product, files: Express.Request["files"]) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: product.merchant_id,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    await this.uploadAndSaveMediasIfExist(files, product.id);

    return prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        ...product,
        updatedAt: new Date(),
      },
    });
  }

  async deleteProductById(id: number) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    return prisma.product.delete({
      where: {
        id,
      },
    });
  }

  private async uploadAndSaveMediasIfExist(
    files: Express.Request["files"],
    productId: number
  ) {
    if (files && files.length != 0) {
      const mediaUrls = await Promise.all(
        (files as any).map((file: any) => this.mediaService.uploadMedia(file))
      );

      const mediaData: MediaData[] = mediaUrls.map((mediaUrl) => ({
        url: mediaUrl,
        itemId: productId,
        type: MediaType.PRODUCT,
      }));

      await this.mediaService.saveMedias(mediaData);
    }
  }
}

export default ProductService;
