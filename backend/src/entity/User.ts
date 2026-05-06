// ===========================================================
// User.ts — Entity representing the User table in the database
// Covers both hirers and vendors, differentiated by the role field
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class User {
  // Automatically increment primary key
  @PrimaryGeneratedColumn()
  userID: number;

  @Column()
  role: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // optional display name (if vendors operate under a business name!)
  @Column({ nullable: true })
  displayName: string;

  @Column()
  phoneNumber: string;

  // automatically set to current date when user is created
  @CreateDateColumn()
  joinedDate: Date;
}
