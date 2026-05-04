declare module "express-serve-static-core" {
  interface Request {
    tracebackId: string;
    user?: {
      userId: number;
      email: string;
    };
  }
}

export {};
