// ===========================================================
// VenueSuitabilityTag.ts — Entity representing the venue suitability tag table in the database
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Venue } from "./Venue";

@Entity()
export class VenueSuitabilityTag {
  // Automatically increment primary key
  @PrimaryGeneratedColumn()
  suitabilityTagID: number;

  // Foreign key — references the venue who has these suitability tags
  @ManyToOne(() => Venue, (venue) => venue.suitabilityTags)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  @Column()
  suitabilityName: string;
}
