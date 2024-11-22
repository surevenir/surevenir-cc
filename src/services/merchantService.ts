import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Merchant } from "@prisma/client";

class MerchantService {
  async createMerchant(merchant: Merchant) {
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

    return prisma.merchant.create({
      data: {
        ...merchant,
      },
    });
  }

  async getAllMerchants() {
    return prisma.merchant.findMany();
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

  async updateMerchant(merchant: Merchant) {
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

    return prisma.merchant.update({
      where: {
        id: merchant.id,
      },
      data: {
        ...merchant,
        updatedAt: new Date(),
      },
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
