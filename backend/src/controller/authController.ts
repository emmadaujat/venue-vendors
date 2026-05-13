import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as argon2 from "argon2";

// sign up
// get details from form
// validate registration details
// hash the password
// save to the database

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Creates a new user in the database
   * @param request - Express request object containing user details in body
   * @param response - Express response object
   * @returns JSON response containing the created user or error message
   */

  // -------------------------------------------------------------------
  // ------------------ REGISTER NEW USER -----------------------------
  // -------------------------------------------------------------------
  async register(request: Request, response: Response) {
    // get details from submitted form
    const { firstName, lastName, email, phoneNumber, role, password } = request.body;

    // validate all required fields have been entered
    if (!firstName || !lastName || !email || !phoneNumber || !role || !password) {
      return response.status(400).json({ message: "All fields are required" });
    }

    // validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response.status(400).json({ message: "Invalid email format" });
    }

    // validate password requirements
    if (password.length < 6) {
      return response.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/[A-Z]/.test(password)) {
      return response.status(400).json({ message: "Must contain an uppercase letter" });
    }
    if (!/\d/.test(password)) {
      return response.status(400).json({ message: "Must contain a number" });
    }

    if (!/[a-z]/.test(password)) {
      return response.status(400).json({ message: "Must contain a lowercase letter" });
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      return response.status(400).json({ message: "Must contain a special character" });
    }

    // check if email address is already taken
    let userEmail = await this.userRepository.findOne({
      where: { email },
    });

    // if email address is already used return error message
    if (userEmail) {
      return response.status(400).json({ message: "Email already taken" });
    }

    // hash password
    const hashedPassword = await argon2.hash(password);

    // save new user to database
    const user = Object.assign(new User(), {
      firstName,
      lastName,
      email,
      phoneNumber,
      role,
      passwordHash: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      return response.status(201).json(savedUser);
    } catch (error) {
      return response.status(400).json({ message: "Error creating user", error });
    }
  }

  // -------------------------------------------------------------------
  // ------------------ SIGN IN ----------------------------------------
  // -------------------------------------------------------------------
  async signIn(request: Request, response: Response) {
    const { email, password } = request.body;

    // check if email address is valid in database
    let user = await this.userRepository.findOne({
      where: { email },
    });

    // if email address doesn't exist in database, return error message
    if (!user) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    // check if typed password matches the hashed password in database
    const isValid = await argon2.verify(user.passwordHash, password);

    // if password not valid, return error message
    if (!isValid) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    // send back user data to front end
    return response.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.userID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  }
}
