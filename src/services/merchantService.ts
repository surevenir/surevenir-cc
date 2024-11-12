import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { Merchant } from "@prisma/client";

class MerchantService {
  async createmerchant(merchant: Merchant) {
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

  async updateMerchant(merchant: Merchant) {
    const existingMerchant = await prisma.merchant.findFirst({
      where: {
        id: merchant.id,
      },
    });

    if (!existingMerchant) {
      throw new ResponseError(404, "Merchant not found");
    }

    return prisma.merchant.update({
      where: {
        id: merchant.id,
      },
      data: {
        ...merchant,
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
