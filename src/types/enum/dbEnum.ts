enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MERCHANT = "MERCHANT",
}

enum ImageType {
  PRODUCT = "PRODUCT",
  MARKET = "MARKET",
  REVIEW = "REVIEW",
}

enum Provider {
  GOOGLE = "GOOGLE",
  EMAIL = "EMAIL",
}

enum CheckoutStatus {
  PENDING = "PENDING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

enum PubSubTopic {
  REVIEW = "surevenir-review",
  CHECKOUT = "surevenir-checkout",
  UPDATE_CHECKOUT_STATUS = "surevenir-update-status-checkout",
}

export { Role, ImageType, Provider, CheckoutStatus, PubSubTopic };
