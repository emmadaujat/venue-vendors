// ===========================================================
// VendorComment.ts — Entity representing the vendors comments table in the database
// A vendor leaves a comment about a hirer after an accepted application (an accepted application becomes a booking)

// ===========================================================
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Booking } from "./Booking";

@Entity()
export class VendorComment {
  @PrimaryGeneratedColumn()
  commentID: number;

  // Foreign key — references the vendor (User) who wrote the comment
  // Many comments can be written by one vendor
  @ManyToOne(() => User, (user) => user.vendorComments)
  @JoinColumn({ name: "vendorID" })
  vendor: User;

  // Foreign key — references the booking this comment is about
  // One comment belongs to one booking
  @OneToOne(() => Booking, (booking) => booking.vendorComments)
  @JoinColumn({ name: "bookingID" })
  booking: Booking;

  @Column({ length: 1000 })
  commentText: string;

  @Column({ length: 20 })
  credibilityTag: string;

  @CreateDateColumn()
  dateAdded: Date;

  @CreateDateColumn()
  dateLastEdit: Date;
}
