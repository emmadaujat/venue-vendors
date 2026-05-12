// ===========================================================
// Applications.ts — Entity representing the applications table in the database
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Venue } from "./Venue";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  applicationID: number;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userID" })
  hirer: User;

  @Column()
  eventName: string;

  @Column()
  eventType: string;

  @Column()
  eventDate: Date;

  @Column()
  guestCount: number;

  @Column({ nullable: true })
  additionalNotes: string;

  @Column()
  status: string;

  @Column()
  submittedAt: Date;
}
