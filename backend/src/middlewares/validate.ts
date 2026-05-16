// ===========================================================
// validate.ts — middleware that checks the request body
// ===========================================================
// Instead of writing "if (!name) ..." checks by hand in every
// controller, we describe the rules ONCE on a DTO class using
// class-validator decorators (e.g. @IsString(), @Min(1)).
//
// validateDto(SomeDto) is then dropped into a route. It:
//   1. turns the raw JSON body into an instance of the DTO,
//   2. runs all the decorator rules,
//   3. if anything fails -> replies 400 with a clear list,
//   4. if everything passes -> lets the request continue.
//
// (Task S4). 
// It is based on the week9 lecture example (example1/
// backend/src/middlewares/validate.ts) and is used by Aleeya's
// booking/compliance routes and Emma's auth/venue routes.
// ===========================================================

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Turn the plain JSON body into a real DTO object so the
    // class-validator decorators on it can be checked.
    const instance = plainToInstance(dtoClass, req.body);

    // whitelist: true strips out any extra fields the client tried
    // to send that we did not ask for (a small security win).
    const errors = await validate(instance as object, { whitelist: true });

    if (errors.length > 0) {
      // Two shapes are returned on purpose:
      //  - "errors": detailed per-field messages (good for the UI)
      //  - "fields": just the field names that failed (easy for
      //    unit tests to assert, e.g. expect fields to include
      //    "password"). The HD sign-up test relies on this.
      return res.status(400).json({
        message: "Validation failed",
        fields: errors.map((e) => e.property),
        errors: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    }

    // Replace the body with the cleaned/validated version so the
    // controller always works with trusted data.
    req.body = instance;
    next();
  };
}
