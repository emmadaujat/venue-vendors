// validate.ts - Express middleware that validates the request body against a class-validator DTO.
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.body);

    // whitelist: true strips extra fields the client sends that are not declared on the DTO.
    const errors = await validate(instance as object, { whitelist: true });

    if (errors.length > 0) {
      // `fields` is a flat list of failing property names; used by tests to assert
      // which field failed without coupling to constraint message text.
      return res.status(400).json({
        message: "Validation failed",
        fields: errors.map((e) => e.property),
        errors: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    }

    req.body = instance;
    next();
  };
}
