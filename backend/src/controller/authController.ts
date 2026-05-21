import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as argon2 from "argon2";
import { signToken } from "../utils/jwt";
// sign up
// get details from form
// validate registration details
// hash the password
// save to the database

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * @param request - Express request object containing user details in body
   * @param response - Express response object
   * @returns JSON response containing the created user or error message
   */

  // -------------------------------------------------------------------
  // ------------------ REGISTER NEW USER -----------------------------
  // -------------------------------------------------------------------
  async register(request: Request, response: Response) {
    // get details from submitted form, validation check handled in DTO
    const { firstName, lastName, email, phoneNumber, role, password } = request.body;

    // check if email address is already taken
    let existingUser = await this.userRepository.findOne({
      where: { email },
    });

    // if email address is already used return error message
    if (existingUser) {
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
  // Returns user data and a signed JWT token on success.
  async signIn(request: Request, response: Response) {
    const { email, password } = request.body;

    // check if email address is valid in database
    const user = await this.userRepository.findOne({
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

    // Sign a JWT with the user's id, role and email
    const token = signToken({ id: user.userID, role: user.role, email: user.email });

    // send back user data with token to front end
    return response.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.userID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  }

  // -------------------------------------------------------------------
  // ------------------ GET USER PROFILE -------------------------------
  // -------------------------------------------------------------------
  // Requires a valid JWT
  async getUserProfile(request: Request, response: Response) {
    // get userID from the URL and convert to int
    const userID = parseInt(request.params.id as string); //matches name in route file
    const loggedInID = request.user!.id;

    // check if profile trying to view matches logged in user
    if (userID !== loggedInID) {
      return response.status(403).json({ message: "Not authorised to view this profile" });
    }

    // find user in database
    const user = await this.userRepository.findOne({
      where: { userID: userID },
    });

    // if no user found
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    // return user details
    return response.status(200).json({
      message: "User Profile successfully retrieved",
      userProfile: {
        userID: user.userID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        joinedDate: user.joinedDate,
      },
    });
  }
}
