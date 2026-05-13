// ===========================================================
// User.ts — Entity representing the User table in the database
// Covers both hirers and vendors, differentiated by the role field
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";

import { Venue } from "./Venue";
import { Application } from "./Application";
import { ComplianceDocument } from "./ComplianceDocument";
import { VendorComment } from "./VendorComment";

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

  // optional display name
  @Column({ nullable: true })
  displayName: string;

  @Column()
  phoneNumber: string;

  // automatically set to current date when user is created
  @CreateDateColumn()
  joinedDate: Date;

  // A user - vendor, can own many venues
  @OneToMany(() => Venue, (venue) => venue.vendor)
  venues: Venue[];

  // A user - hirer, can submit many applications
  @OneToMany(() => Application, (application) => application.hirer)
  applications: Application[];

  // A user - hirer, can have many compliance documents
  @OneToMany(() => ComplianceDocument, (doc) => doc.hirer)
  complianceDocuments: ComplianceDocument[];

  // A user - vendor, can leave many comments
  @OneToMany(() => VendorComment, (comment) => comment.vendor)
  vendorComments: VendorComment[];
}
