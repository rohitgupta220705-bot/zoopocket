import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaymentSessionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/payments/create", async (req, res) => {
    try {
      const parsed = insertPaymentSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payment data", details: parsed.error.errors });
      }

      const session = await storage.createPaymentSession(parsed.data);
      return res.json({ 
        success: true, 
        paymentId: session.id,
        paymentUrl: `/payment?id=${session.id}`
      });
    } catch (error) {
      console.error("Failed to create payment session:", error);
      return res.status(500).json({ error: "Failed to create payment session" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getPaymentSession(id);
      
      if (!session) {
        return res.status(404).json({ error: "Payment session not found" });
      }

      if (session.expiresAt && new Date() > session.expiresAt) {
        return res.status(410).json({ error: "Payment session has expired" });
      }

      return res.json({
        id: session.id,
        amount: session.amount,
        vpa: session.vpa,
        merchantName: session.merchantName,
        status: session.status,
      });
    } catch (error) {
      console.error("Failed to get payment session:", error);
      return res.status(500).json({ error: "Failed to get payment session" });
    }
  });

  app.patch("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const session = await storage.updatePaymentSessionStatus(id, status);
      
      if (!session) {
        return res.status(404).json({ error: "Payment session not found" });
      }

      return res.json({ success: true, session });
    } catch (error) {
      console.error("Failed to update payment status:", error);
      return res.status(500).json({ error: "Failed to update payment status" });
    }
  });

  return httpServer;
}
