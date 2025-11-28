import { type User, type InsertUser, type PaymentSession, type InsertPaymentSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPaymentSession(session: InsertPaymentSession): Promise<PaymentSession>;
  getPaymentSession(id: string): Promise<PaymentSession | undefined>;
  updatePaymentSessionStatus(id: string, status: string): Promise<PaymentSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private paymentSessions: Map<string, PaymentSession>;

  constructor() {
    this.users = new Map();
    this.paymentSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPaymentSession(insertSession: InsertPaymentSession): Promise<PaymentSession> {
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    const session: PaymentSession = {
      ...insertSession,
      id,
      status: "pending",
      createdAt: now,
      expiresAt,
    };
    this.paymentSessions.set(id, session);
    return session;
  }

  async getPaymentSession(id: string): Promise<PaymentSession | undefined> {
    return this.paymentSessions.get(id);
  }

  async updatePaymentSessionStatus(id: string, status: string): Promise<PaymentSession | undefined> {
    const session = this.paymentSessions.get(id);
    if (session) {
      session.status = status;
      this.paymentSessions.set(id, session);
    }
    return session;
  }
}

export const storage = new MemStorage();
