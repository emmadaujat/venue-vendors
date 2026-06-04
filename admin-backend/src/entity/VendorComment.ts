// VendorComment.ts - a comment a vendor leaves on a hirer after a completed booking.
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

  @ManyToOne(() => User, (user) => user.vendorComments)
  @JoinColumn({ name: "vendorID" })
  vendor: User;

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
