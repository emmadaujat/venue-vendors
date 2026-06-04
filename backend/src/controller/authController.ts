// authController.ts - handles user registration, sign-in, and profile retrieval.
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import * as argon2 from "argon2";
import { signToken } from "../utils/jwt";

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async register(request: Request, response: Response) {
    const { firstName, lastName, email, phoneNumber, role, password } = request.body;

    let existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return response.status(400).json({ message: "Email already taken" });
    }

    const hashedPassword = await argon2.hash(password);

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

  async signIn(request: Request, response: Response) {
    const { email, password } = request.body;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    const isValid = await argon2.verify(user.passwordHash, password);

    if (!isValid) {
      return response.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken({ id: user.userID, role: user.role, email: user.email });

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

  async getUserProfile(request: Request, response: Response) {
    const userID = parseInt(request.params.id as string);
    const loggedInID = request.user!.id;

    if (userID !== loggedInID) {
      return response.status(403).json({ message: "Not authorised to view this profile" });
    }

    const user = await this.userRepository.findOne({
      where: { userID: userID },
    });

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

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
