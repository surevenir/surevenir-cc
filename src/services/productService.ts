import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Product } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class ProductService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createProduct(
    product: Product,
    categoryIds: number[],
    files: Express.Request["files"]
  ) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: product.merchant_id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    const createdProduct = await prisma.product.create({
      data: product,
    });

    await prisma.productCategory.createMany({
      data: categoryIds.map((category_id) => ({
        product_id: createdProduct.id,
        category_id,
      })),
    });

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    const images = await this.uploadAndSaveMediasIfExist(
      files,
      createdProduct.id
    );

    return {
      ...createdProduct,
      categories,
      images,
    };
  }

  async getProductById(id: number, userId: string) {
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
        },
      },
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

    const isFavorite = await prisma.favorite.findFirst({
      where: {
        product_id: id,
        user_id: userId,
      },
    });

    return {
      ...product,
      images: imagesUrl,
      is_favorite: isFavorite ? true : false,
    };
  }

  async getAllProducts(sort_by: string, category: string) {
    const sortOptions: Record<
      string,
      { column: string; direction: "asc" | "desc" }
    > = {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
      price_asc: { column: "price", direction: "asc" },
      price_desc: { column: "price", direction: "desc" },
      // popular: { column: "popularity", direction: "desc" },
    };

    const sortOption = sortOptions[sort_by] || sortOptions.newest;

    let products = await prisma.product.findMany({
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

  async getProductReviews(id: number) {
    let reviews = await prisma.review.findMany({
      where: {
        product_id: id,
      },
      include: {
        user: true,
      },
    });

    const imagesUrl = await prisma.images.findMany({
      where: {
        item_id: {
          in: reviews.map((review) => review.id),
        },
        type: MediaType.REVIEW,
      },
    });

    reviews = reviews.map((review) => ({
      ...review,
      images: imagesUrl
        .filter((image) => image.item_id === review.id)
        .map((image) => image.url),
    }));

    return reviews;
  }

  async updateProduct(
    product: Product,
    categoryIds: number[],
    files: Express.Request["files"]
  ) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: product.id,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: product.merchant_id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    await this.uploadAndSaveMediasIfExist(files, product.id);

    const updatedProduct = await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        name: product.name,
        description: product.description,
        merchant_id: product.merchant_id,
        price: product.price,
        stock: product.stock,
      },
    });

    if (categoryIds.length > 0) {
      await prisma.productCategory.deleteMany({
        where: {
          product_id: product.id,
        },
      });

      await prisma.productCategory.createMany({
        data: categoryIds.map((category_id) => ({
          product_id: product.id,
          category_id,
        })),
      });
    }

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });

    const images = await prisma.images.findMany({
      where: {
        item_id: product.id,
        type: MediaType.PRODUCT,
      },
    });

    return {
      ...updatedProduct,
      categories,
      images,
    };
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

    try {
      await this.mediaService.deleteMediaForItem(id, MediaType.PRODUCT);

      console.log("Media for merchant deleted successfully.");
    } catch (error) {
      console.error("Error deleting media for merchant:", error);
      throw new ResponseError(500, "Failed to delete media for merchant");
    }

    return await prisma.product.delete({
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

      return mediaData;
    }
  }

  async addProductImages(productId: number, files: Express.Request["files"]) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    if (!files || (files as any).length === 0) {
      throw new ResponseError(400, "No files exist");
    }

    const mediaUrls = await Promise.all(
      (files as any).map((file: any) => this.mediaService.uploadMedia(file))
    );

    const mediaData: MediaData[] = mediaUrls.map((mediaUrl) => ({
      url: mediaUrl,
      itemId: productId,
      type: MediaType.PRODUCT,
    }));

    await this.mediaService.saveMedias(mediaData);

    return mediaData;
  }

  async getTopFavoritedProducts(limit: number) {
    let products = await prisma.$queryRaw`
      SELECT p.*, COUNT(f.product_id) as favorite_count
      FROM product p
      LEFT JOIN favorite f ON p.id = f.product_id
      GROUP BY p.id
      ORDER BY favorite_count DESC
      LIMIT ${limit}
    `;

    const productIds: number[] = (products as any).map(
      (product: any) => product.id
    );
    products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
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
        },
      },
    });

    const imagesUrl = await prisma.images.findMany({
      where: {
        item_id: {
          in: productIds,
        },
        type: MediaType.PRODUCT,
      },
    });

    products = (products as any).map((product: any) => ({
      ...product,
      images: imagesUrl.filter((image) => image.item_id === product.id),
    }));

    return products;
  }

  async addProductToFavorite(productId: number, userId: string) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      throw new ResponseError(404, "Product not found");
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        product_id: productId,
        user_id: userId,
      },
    });

    if (existingFavorite) {
      throw new ResponseError(400, "Product already added to favorite");
    }

    return await prisma.favorite.create({
      data: {
        product_id: productId,
        user_id: userId,
      },
    });
  }

  async deleteProductFromFavorite(id: number) {
    return await prisma.favorite.delete({
      where: {
        id,
      },
    });
  }
}

export default ProductService;
