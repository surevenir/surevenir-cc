import { Request, Response, NextFunction } from "express";

function Controller<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      // Get all method names from the prototype (excluding the constructor)
      const methodNames = Object.getOwnPropertyNames(constructor.prototype).filter(
        (name) => name !== "constructor"
      );

      for (const methodName of methodNames) {
        const originalMethod = (this as any)[methodName];

        // Bind and wrap each method in async error handling
        (this as any)[methodName] = async (
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          try {
            await originalMethod.call(this, req, res, next);
          } catch (error) {
            next(error);
          }
        };
      }
    }
  };
}

export default Controller;
