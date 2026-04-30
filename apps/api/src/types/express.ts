declare module "express-serve-static-core" {
  interface Request {
    tracebackId: string;
  }
}

export {};
