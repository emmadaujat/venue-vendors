// Application.ts - represents a hirer's application to book a venue (status: pending/approved/declined).
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Venue } from "./Venue";
import { HirerReputationTag } from "./HirerReputationTag";
import { Booking } from "./Booking";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  applicationID: number;

  @ManyToOne(() => Venue, (venue) => venue.applications, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: "hirerID" })
  hirer: User;

  @Column()
  eventName: string;

  @Column()
  eventType: string;

  @Column()
  eventDate: Date;

  @Column({ nullable: true })
  eventEndDate: Date;

  @Column()
  guestCount: number;

  @Column({ nullable: true })
  additionalNotes: string;

  @Column({ length: 20, default: "pending" })
  status: string;

  @CreateDateColumn()
  submittedAt: Date;

  @OneToMany(() => HirerReputationTag, (tag) => tag.application)
  reputationTags: HirerReputationTag[];

  @OneToOne(() => Booking, (booking) => booking.application)
  booking: Booking;
}
