import { Request, Response, NextFunction } from "express";

/**
 * A decorator function that wraps each method of the given class with
 * try-catch blocks and passes the caught error to the next middleware in
 * the Express middleware chain using the `next` function.
 *
 * @param constructor The class whose methods will be wrapped.
 * @returns A new class that extends the given class and overrides all its
 *          methods with the wrapped versions.
 */
function Controller<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      const methodNames = Object.getOwnPropertyNames(
        constructor.prototype
      ).filter((name) => name !== "constructor");

      for (const methodName of methodNames) {
        const originalMethod = (this as any)[methodName];

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
