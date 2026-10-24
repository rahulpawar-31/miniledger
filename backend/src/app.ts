import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { requestOtp, requireAuth, verifyOtp } from "./auth.js";
import { addLoan, listLoans, markRepaid, summary } from "./loans.js";
import { HttpError, validId } from "./validate.js";

// Wrap async handlers so a thrown error goes to the error handler below.
const route = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

const userIdOf = (req: Request) => (req as Request & { userId: number }).userId;

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Login (public)
  app.post("/auth/request-otp", route(async (req, res) => {
    await requestOtp(req.body?.phone);
    res.json({ message: "OTP created. In this demo it is printed in the server log." });
  }));
  app.post("/auth/verify-otp", route(async (req, res) => {
    const token = await verifyOtp(req.body?.phone, req.body?.otp);
    res.json({ token });
  }));

  // Everything below needs a valid token.
  app.use(requireAuth);

  app.post("/loans", route(async (req, res) => {
    res.status(201).json(await addLoan(userIdOf(req), req.body ?? {}));
  }));
  app.get("/loans", route(async (req, res) => {
    res.json(await listLoans(userIdOf(req)));
  }));
  app.patch("/loans/:id/repaid", route(async (req, res) => {
    res.json(await markRepaid(userIdOf(req), validId(req.params.id)));
  }));
  app.get("/summary", route(async (req, res) => {
    res.json(await summary(userIdOf(req)));
  }));

  // One place that turns errors into JSON answers.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
    // Express's own errors (for example a request body that is not valid JSON) carry a 4xx status.
    const status = (err as { status?: number }).status;
    if (status && status >= 400 && status < 500) return void res.status(status).json({ error: "invalid request" });
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
  });

  return app;
}
