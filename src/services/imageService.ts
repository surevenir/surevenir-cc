import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Images } from "@prisma/client";

class ImageService {
  async createImage(image: Images) {
    return prisma.images.create({
      data: {
        ...image,
      },
    });
  }

  async getAllImages() {
    return prisma.images.findMany();
  }

  async getImageById(id: number) {
    const image = prisma.images.findUnique({
      where: {
        id,
      },
    });

    if (!image) {
      throw new ResponseError(404, "Image not found");
    }

    return image;
  }

  async updateImage(image: Images) {
    const existingImage = await prisma.images.findFirst({
      where: {
        id: image.id,
      },
    });

    if (!existingImage) {
      throw new ResponseError(404, "Image not found");
    }

    return prisma.images.update({
      where: {
        id: image.id,
      },
      data: {
        ...image,
        updatedAt: new Date(),
      },
    });
  }

  async deleteImageById(id: number) {
    const existingImage = await prisma.images.findFirst({
      where: {
        id,
      },
    });

    if (!existingImage) {
      throw new ResponseError(404, "Image not found");
    }

    return prisma.images.delete({
      where: {
        id,
      },
    });
  }
}

export default ImageService;
