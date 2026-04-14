export enum Role {
  BUYER = "BUYER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SUSPENDED = "SUSPENDED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
  TRIALING = "TRIALING",
}

export enum ProductCategory {
  SOFTWARE = "SOFTWARE",
  EBOOKS = "EBOOKS",
  COURSES = "COURSES",
  TEMPLATES = "TEMPLATES",
  GRAPHICS = "GRAPHICS",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  OTHER = "OTHER",
}

