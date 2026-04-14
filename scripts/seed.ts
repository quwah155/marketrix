import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";

import {
  AccountModel,
  AppVerificationTokenModel,
  MessageModel,
  MessageThreadModel,
  OrderModel,
  ProductModel,
  ReviewModel,
  SessionModel,
  UserModel,
  VendorProfileModel,
} from "@/server/models";
import { OrderStatus, ProductCategory, ProductStatus, Role } from "@/types/db";

async function main() {
  console.log("Seeding database...");
  await connectToDatabase();

  // Clean existing data
  await MessageModel.deleteMany({});
  await MessageThreadModel.deleteMany({});
  await ReviewModel.deleteMany({});
  await OrderModel.deleteMany({});
  await ProductModel.deleteMany({});
  await VendorProfileModel.deleteMany({});
  await AppVerificationTokenModel.deleteMany({});
  await SessionModel.deleteMany({});
  await AccountModel.deleteMany({});
  await UserModel.deleteMany({});

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // ADMIN USER
  const admin = await UserModel.create({
    name: "Platform Admin",
    email: "admin@quwahmarket-saas.com",
    passwordHash,
    role: Role.ADMIN,
    emailVerified: new Date(),
  });
  console.log("Admin created:", admin.email);

  // VENDORS
  const vendorData = [
    {
      name: "Alex Rivera",
      email: "alex@quwahmarket-saas.com",
      bio: "Full-stack developer selling premium Next.js templates and SaaS boilerplates.",
    },
    {
      name: "Sarah Chen",
      email: "sarah@quwahmarket-saas.com",
      bio: "UI/UX designer creating beautiful Figma kits and design systems.",
    },
    {
      name: "Marcus Johnson",
      email: "marcus@quwahmarket-saas.com",
      bio: "Indie developer offering productivity tools and browser extensions.",
    },
  ];

  const vendors = await Promise.all(
    vendorData.map(async (v) => {
      const user = await UserModel.create({
        name: v.name,
        email: v.email,
        passwordHash,
        role: Role.VENDOR,
        emailVerified: new Date(),
      });
      const profile = await VendorProfileModel.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            bio: v.bio,
            verified: true,
            balance: Math.floor(Math.random() * 5000),
          },
          $setOnInsert: {
            userId: user._id,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return { user, profile };
    })
  );
  console.log("Vendors created:", vendors.length);

  // BUYERS
  const buyerData = [
    { name: "Emily Watson", email: "emily@quwahmarket-saas.com" },
    { name: "James O'Brien", email: "james@quwahmarket-saas.com" },
    { name: "Priya Sharma", email: "priya@quwahmarket-saas.com" },
    { name: "Tom Anderson", email: "tom@quwahmarket-saas.com" },
    { name: "Lisa Kim", email: "lisa@quwahmarket-saas.com" },
  ];

  const buyers = await Promise.all(
    buyerData.map((b) =>
      UserModel.create({
        name: b.name,
        email: b.email,
        passwordHash,
        role: Role.BUYER,
        emailVerified: new Date(),
      })
    )
  );
  console.log("Buyers created:", buyers.length);

  // PRODUCTS
  const productData = [
    {
      vendorIdx: 0,
      title: "Next.js SaaS Starter Kit",
      slug: "nextjs-saas-starter-kit",
      description:
        "A production-ready Next.js 14 boilerplate with auth, Stripe, and a beautiful dashboard. Save hundreds of hours of setup time.",
      price: 79,
      category: ProductCategory.SOFTWARE,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 0,
      title: "React Admin Dashboard Template",
      slug: "react-admin-dashboard-template",
      description:
        "Modern admin panel template with 50+ components, dark mode, charts, tables, and full TypeScript support.",
      price: 49,
      category: ProductCategory.TEMPLATES,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 1,
      title: "Premium UI Design System (Figma)",
      slug: "premium-ui-design-system-figma",
      description:
        "Complete design system with 500+ components, tokens, and auto-layout. Works with Figma, Sketch, and Adobe XD.",
      price: 59,
      category: ProductCategory.GRAPHICS,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 1,
      title: "Mobile App UI Kit 2024",
      slug: "mobile-app-ui-kit-2024",
      description:
        "300+ screens for iOS and Android. E-commerce, social, fitness, finance templates included.",
      price: 39,
      category: ProductCategory.GRAPHICS,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 2,
      title: "Mastering TypeScript Patterns",
      slug: "mastering-typescript-patterns",
      description:
        "In-depth video course covering advanced TypeScript patterns, generics, decorators, and real-world architecture.",
      price: 99,
      category: ProductCategory.COURSES,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 2,
      title: "Browser Extension Boilerplate",
      slug: "browser-extension-boilerplate",
      description:
        "Launch a Chrome/Firefox extension in hours. Includes manifest v3, popup, options page, and background workers.",
      price: 29,
      category: ProductCategory.SOFTWARE,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 0,
      title: "Landing Page Component Library",
      slug: "landing-page-component-library",
      description:
        "50 hand-crafted landing page sections built with React and Tailwind CSS. Hero, Features, Pricing, Testimonials, and more.",
      price: 35,
      category: ProductCategory.TEMPLATES,
      status: ProductStatus.DRAFT,
    },
    {
      vendorIdx: 1,
      title: "Startup Pitch Deck Template",
      slug: "startup-pitch-deck-template",
      description:
        "Investor-ready pitch deck template used by Y Combinator startups. 30 slides, editable in Figma and PowerPoint.",
      price: 25,
      category: ProductCategory.TEMPLATES,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 2,
      title: "The Indie Hacker Handbook",
      slug: "the-indie-hacker-handbook",
      description:
        "150+ pages covering building, launching, and growing a profitable indie SaaS. Zero fluff, all actionable.",
      price: 19,
      category: ProductCategory.EBOOKS,
      status: ProductStatus.PUBLISHED,
    },
    {
      vendorIdx: 0,
      title: "PostgreSQL Performance Mastery",
      slug: "postgresql-performance-mastery",
      description:
        "Database optimization course with query tuning, indexing strategies, partitioning, and scaling patterns for production apps.",
      price: 69,
      category: ProductCategory.COURSES,
      status: ProductStatus.PUBLISHED,
    },
  ];

  const products = await Promise.all(
    productData.map((p, i) => {
      const { vendorIdx, ...rest } = p;
      return ProductModel.create({
        ...rest,
        vendorId: vendors[vendorIdx].profile._id,
        views: Math.floor(Math.random() * 2000) + 50,
        thumbnail: `https://picsum.photos/seed/${i + 1}/800/450`,
      });
    })
  );
  console.log("Products created:", products.length);

  // ORDERS
  const orderData = [
    { buyerIdx: 0, productIdx: 0, amount: 79 },
    { buyerIdx: 0, productIdx: 4, amount: 99 },
    { buyerIdx: 1, productIdx: 2, amount: 59 },
    { buyerIdx: 1, productIdx: 5, amount: 29 },
    { buyerIdx: 2, productIdx: 1, amount: 49 },
    { buyerIdx: 2, productIdx: 8, amount: 19 },
    { buyerIdx: 3, productIdx: 9, amount: 69 },
    { buyerIdx: 3, productIdx: 3, amount: 39 },
    { buyerIdx: 4, productIdx: 7, amount: 25 },
    { buyerIdx: 4, productIdx: 0, amount: 79 },
  ];

  const PLATFORM_FEE_PERCENT = 0.15;

  const orders = await Promise.all(
    orderData.map((o) => {
      const platformFee = parseFloat((o.amount * PLATFORM_FEE_PERCENT).toFixed(2));
      const vendorEarning = parseFloat((o.amount - platformFee).toFixed(2));
      return OrderModel.create({
        buyerId: buyers[o.buyerIdx]._id,
        productId: products[o.productIdx]._id,
        amount: o.amount,
        platformFee,
        vendorEarning,
        status: OrderStatus.COMPLETED,
        stripeSessionId: `cs_test_seed_${Math.random().toString(36).slice(2)}`,
      });
    })
  );
  console.log("Orders created:", orders.length);

  // REVIEWS
  const reviewData = [
    {
      buyerIdx: 0,
      productIdx: 0,
      rating: 5,
      comment: "Incredible starter kit. Saved me at least 2 weeks of setup. Highly recommended!",
    },
    {
      buyerIdx: 0,
      productIdx: 4,
      rating: 5,
      comment: "Best TypeScript course I've taken. Marcus explains things so clearly.",
    },
    {
      buyerIdx: 1,
      productIdx: 2,
      rating: 4,
      comment: "Beautiful design system. A few components need mobile improvements but overall great.",
    },
    {
      buyerIdx: 2,
      productIdx: 1,
      rating: 5,
      comment: "50+ components and they all look premium. Worth every penny.",
    },
    {
      buyerIdx: 3,
      productIdx: 9,
      rating: 5,
      comment: "Finally a database course that focuses on real production scenarios.",
    },
    {
      buyerIdx: 4,
      productIdx: 0,
      rating: 4,
      comment: "Great code quality. Would love more documentation on the advanced features.",
    },
  ];

  await Promise.all(
    reviewData.map((r) =>
      ReviewModel.create({
        buyerId: buyers[r.buyerIdx]._id,
        productId: products[r.productIdx]._id,
        rating: r.rating,
        comment: r.comment,
      })
    )
  );
  console.log("Reviews created:", reviewData.length);

  // MESSAGES
  const thread = await MessageThreadModel.create({
    buyerId: buyers[0]._id,
    vendorId: vendors[0].user._id,
  });

  await MessageModel.insertMany([
    {
      threadId: thread._id,
      senderId: buyers[0]._id,
      content: "Hi! I purchased the SaaS Starter Kit. Is the auth already production-ready?",
    },
    {
      threadId: thread._id,
      senderId: vendors[0].user._id,
      content:
        "Hey! Yes, it uses NextAuth with JWT + Google OAuth, bcrypt hashing, and email verification out of the box.",
    },
    {
      threadId: thread._id,
      senderId: buyers[0]._id,
      content: "Perfect. Does it include Stripe subscriptions as well?",
    },
    {
      threadId: thread._id,
      senderId: vendors[0].user._id,
      content: "Yes! Both one-time payments and subscriptions are wired up with full webhook handling.",
    },
  ]);
  console.log("Messages seeded");

  console.log("\nSeeding complete!");
  console.log("\nTest accounts (all passwords: Password123!):");
  console.log("   Admin: admin@quwahmarket-saas.com");
  console.log(
    "   Vendors: alex@quwahmarket-saas.com | sarah@quwahmarket-saas.com | marcus@quwahmarket-saas.com"
  );
  console.log(
    "   Buyers: emily@quwahmarket-saas.com | james@quwahmarket-saas.com | priya@quwahmarket-saas.com | tom@quwahmarket-saas.com | lisa@quwahmarket-saas.com"
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
