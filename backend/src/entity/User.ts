// User.ts - User entity. Covers both hirers and vendors; the role column differentiates them.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";

import { Venue } from "./Venue";
import { Application } from "./Application";
import { ComplianceDocument } from "./ComplianceDocument";
import { VendorComment } from "./VendorComment";
import { SavedVenue } from "./SavedVenue";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userID: number;

  @Column({ length: 20, default: "hirer" })
  role: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: "passwordHash" })
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ length: 10 })
  phoneNumber: string;

  @CreateDateColumn()
  joinedDate: Date;

  @OneToMany(() => Venue, (venue) => venue.vendor)
  venues: Venue[];

  @OneToMany(() => Application, (application) => application.hirer)
  applications: Application[];

  @OneToMany(() => ComplianceDocument, (doc) => doc.hirer)
  complianceDocuments: ComplianceDocument[];

  @OneToMany(() => VendorComment, (comment) => comment.vendor)
  vendorComments: VendorComment[];

  @OneToMany(() => SavedVenue, (savedVenue) => savedVenue.hirer)
  savedVenues: SavedVenue[];
}
