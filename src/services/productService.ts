import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Product, User } from "@prisma/client";
import MediaService, { MediaData, MediaType } from "./mediaService";

class ProductService {
  private mediaService: MediaService;

  /**
   * Constructor for the ProductService class.
   * Initializes the MediaService instance which is used to
   * interact with the media table in the database.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Creates a new product.
   * @param product The product to be created.
   * @param categoryIds The category IDs to associate with the product.
   * @param files The files to be uploaded as product images.
   * @returns The created product with its associated categories and images.
   * @throws ResponseError if the merchant is not found, or if any of the categories are not found.
   */
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

  /**
   * Retrieves a product by its ID, including its merchant, categories, images, and favorite status for a user.
   * @param id - The ID of the product to retrieve.
   * @param userId - The ID of the user to check if the product is in their favorites.
   * @returns A Promise that resolves to the product with its associated merchant, categories, images, and favorite status.
   * @throws ResponseError if the product is not found.
   */
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

  /**
   * Retrieves all products, with options to sort by creation date or price, and to filter by category.
   * @param sort_by - The column to sort by. Options are "newest", "oldest", "price_asc", and "price_desc". Defaults to "newest" if not specified.
   * @param category - The name of the category to filter by. If not specified, all products are returned.
   * @returns A Promise that resolves to an array of products, each with their associated merchant, categories, and images.
   */
  async getAllProducts(sort_by: string, category: string) {
    const sortOptions: Record<
      string,
      { column: string; direction: "asc" | "desc" }
    > = {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
      price_asc: { column: "price", direction: "asc" },
      price_desc: { column: "price", direction: "desc" },
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

  /**
   * Retrieves all products owned by the specified user, sorted by the specified
   * column in the specified direction, and filtered by the specified category.
   * @param sort_by - The column to sort by. Can be "newest", "oldest", "price_asc", or "price_desc". Defaults to "newest".
   * @param category - The category of products to retrieve. If not specified, all products are retrieved.
   * @param user - The user whose products are being retrieved.
   * @returns A Promise that resolves to an array of products, each with their associated merchant, categories, and images.
   */
  async getAllProductsByOwner(sort_by: string, category: string, user: User) {
    const sortOptions: Record<
      string,
      { column: string; direction: "asc" | "desc" }
    > = {
      newest: { column: "createdAt", direction: "desc" },
      oldest: { column: "createdAt", direction: "asc" },
      price_asc: { column: "price", direction: "asc" },
      price_desc: { column: "price", direction: "desc" },
    };

    const sortOption = sortOptions[sort_by] || sortOptions.newest;

    let products = await prisma.product.findMany({
      where: {
        merchant: {
          user_id: user.id,
        },
        ...(category !== "all"
          ? {
              product_categories: {
                some: {
                  category: {
                    name: category,
                  },
                },
              },
            }
          : {}),
      },
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

  /**
   * Retrieves a product by its slug along with its merchant, categories, images, favorite status, and reviews.
   * @param slug - The slug of the product to retrieve.
   * @param userId - The ID of the user to check if the product is a favorite.
   * @returns A Promise that resolves to an object containing the product details, including its merchant,
   * categories, images, whether it is a favorite for the given user, and its reviews with associated images.
   * @throws ResponseError if the product is not found.
   */
  async getProductBySlug(slug: string, userId: string) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            profile_image_url: true,
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

    if (!product) {
      throw new ResponseError(404, "Product not found");
    }

    const imagesUrl = await prisma.images.findMany({
      where: {
        item_id: product.id,
        type: MediaType.PRODUCT,
      },
    });

    const isFavorite = await prisma.favorite.findFirst({
      where: {
        product_id: product.id,
        user_id: userId,
      },
    });

    const reviews = await prisma.review.findMany({
      where: {
        product_id: product.id,
      },
      include: {
        user: true,
      },
    });

    const reviewImages = await prisma.images.findMany({
      where: {
        item_id: {
          in: reviews.map((review) => review.id),
        },
        type: MediaType.REVIEW,
      },
    });

    const reviewsWithImages = reviews.map((review) => ({
      ...review,
      images: reviewImages
        .filter((image) => image.item_id === review.id)
        .map((image) => image.url),
    }));

    return {
      ...product,
      images: imagesUrl,
      is_favorite: isFavorite ? true : false,
      reviews: reviewsWithImages,
    };
  }

  /**
   * Retrieves all reviews of a product by its ID.
   * @param id - The unique identifier of the product whose reviews are being retrieved.
   * @returns A Promise that resolves to an array of reviews of the product with the specified ID.
   * Each review includes its associated user and an array of image URLs.
   */
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

  /**
   * Updates a product by its ID.
   * @param product - The product object containing updated information.
   * @param categoryIds - An array of category IDs to update the product's categories.
   * @param files - An array of files to update the product's images.
   * @returns A Promise that resolves to the updated product.
   * @throws ResponseError if the product or merchant is not found.
   */
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

  /**
   * Deletes a product by its ID.
   * @param id The ID of the product to delete.
   * @returns The deleted product.
   * @throws ResponseError if the product is not found.
   */
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

  /**
   * Uploads and saves media files if they exist for a given product.
   * @param files The media files to be uploaded and saved.
   * @param productId The ID of the product to associate with the media files.
   * @returns A promise that resolves to an array of saved media data.
   * @throws ResponseError if an error occurs during the upload or save process.
   */
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

  /**
   * Adds images to a specified product.
   * @param productId The ID of the product to add images to.
   * @param files The files to be uploaded as images.
   * @returns A Promise that resolves to an array of saved media data.
   * @throws ResponseError if the product is not found or if no files exist.
   */
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

  /**
   * Retrieves the top favorited products with the specified limit.
   * @param limit The limit of products to retrieve.
   * @returns A Promise that resolves to an array of products, each with their associated categories, merchant, and images.
   * The array is sorted by the number of favorites in descending order.
   */
  async getTopFavoritedProducts(limit: number) {
    let products = await prisma.$queryRaw`
      SELECT p.*, COUNT(f.product_id) as favorite_count
      FROM products p
      LEFT JOIN favorites f ON p.id = f.product_id
      GROUP BY p.id
      ORDER BY favorite_count DESC
      LIMIT ${limit}
    `;

    console.log(products);

    const productIds: {
      id: number;
      favorite_count: number;
    }[] = (products as any).map((product: any) => {
      return {
        id: product.id,
        favorite_count: parseInt(product.favorite_count),
      };
    });

    products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds.map((p) => p.id),
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
          in: productIds.map((p) => p.id),
        },
        type: MediaType.PRODUCT,
      },
    });

    products = (products as any).map((product: any) => ({
      ...product,
      images: imagesUrl.filter((image) => image.item_id === product.id),
      favorite_count:
        productIds?.find((p) => p.id === product.id)?.favorite_count || 0,
    }));

    (products as any).sort(
      (a: any, b: any) => b.favorite_count - a.favorite_count
    );

    return products;
  }

  /**
   * Retrieves the products favorited by a user, including details about each product's merchant,
   * categories, and images.
   * @param userId - The unique identifier of the user whose favorited products are being retrieved.
   * @returns A Promise that resolves to an array of favorited products, each containing the product
   * details, associated merchant information, categories, and image URLs.
   */
  async getFavoritedProducts(userId: string) {
    let products = await prisma.favorite.findMany({
      where: {
        user_id: userId,
      },
      include: {
        product: {
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
        },
      },
    });

    const productIds = products.map((product) => product.product_id);
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
      images: imagesUrl
        .filter((image) => image.item_id === product.product_id)
        .map((image) => image.url),
    }));

    return products;
  }

  /**
   * Adds a product to the user's list of favorite products.
   * @param productId - The unique identifier of the product to add to the user's favorites.
   * @param userId - The unique identifier of the user whose favorites are being updated.
   * @returns A Promise that resolves to the newly added favorite product.
   * @throws {ResponseError} If the product is already in the user's favorites.
   */
  async addProductToFavorite(productId: number, userId: string) {
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

  /**
   * Deletes a product from the user's list of favorite products.
   * @param productId - The unique identifier of the product to delete from the user's favorites.
   * @param userId - The unique identifier of the user whose favorites are being updated.
   * @returns A Promise that resolves to an object with the deleted product ID.
   */
  async deleteProductFromFavorite(productId: number, userId: string) {
    await prisma.favorite.deleteMany({
      where: {
        product_id: productId,
        user_id: userId,
      },
    });

    return {
      product_id: productId,
    };
  }
}

export default ProductService;
