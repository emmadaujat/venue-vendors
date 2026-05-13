// ===========================================================
// VenueBlockedDates.ts — Entity representing the venue blocked dates table in the database
// Each row is one blocked date range for a venue
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Venue } from "./Venue";

@Entity()
export class VenueBlockedDates {
  // Automatically increment primary key
  @PrimaryGeneratedColumn()
  blockedID: number;

  // Foreign key — references the venue that has this blocked date range
  // 0 or Many blocked dates can belong to one venue
  @ManyToOne(() => Venue, (venue) => venue.blockedDates, { nullable: true })
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  // Start date of the blocked period
  @Column()
  startDate: Date;

  // End date of the blocked period
  @Column()
  endDate: Date;

  // Optional reason for blocking e.g. "Maintenance", "Private event"
  @Column({ nullable: true })
  reason: string;
}
