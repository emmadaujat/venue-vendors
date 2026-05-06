// ===========================================================
// Venue.ts — Entity representing the venue table in the database
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Venue {
  // Auto-incremented primary key
  @PrimaryGeneratedColumn()
  venueID: number;

  // Foreign key — references the vendor (User) who owns this venue
  @ManyToOne(() => User)
  @JoinColumn({ name: "userID" })
  vendor: User;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  // Precision = total number of digits
  // Scale = number of digits after the decimal point
  @Column("decimal", { precision: 10, scale: 2 })
  pricePerDay: number;

  // Rating stored as decimal e.g. 4.7
  @Column("decimal", { precision: 3, scale: 1 })
  rating: number;

  @Column()
  reviewCount: number;

  @Column("text")
  shortDescription: string;

  @Column()
  imageURL: string;

  @Column()
  availabilityStatus: string;
}
