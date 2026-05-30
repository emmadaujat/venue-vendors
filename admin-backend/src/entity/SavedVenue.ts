// ===========================================================
// SavedVenue.ts — Entity representing a hirer's saved/preferred venues
// A hirer can save multiple venues and rank them by preference order
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Venue } from "./Venue";

@Entity()
export class SavedVenue {
  @PrimaryGeneratedColumn()
  savedVenueID: number;

  // Foreign key — the hirer who saved this venue
  @ManyToOne(() => User, (user) => user.savedVenues)
  @JoinColumn({ name: "hirerID" })
  hirer: User;

  // Foreign key — the venue that was saved
  @ManyToOne(() => Venue, (venue) => venue.savedByUsers)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  // Preference ranking — hirer can reorder their saved venues (1 = most preferred)
  @Column()
  rankingOrder: number;
}
