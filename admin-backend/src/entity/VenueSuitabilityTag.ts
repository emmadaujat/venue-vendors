// VenueSuitabilityTag.ts - one suitability tag row per event type per venue (e.g. "Wedding", "Corporate").
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Venue } from "./Venue";

@Entity()
export class VenueSuitabilityTag {
  @PrimaryGeneratedColumn()
  suitabilityTagID: number;

  @ManyToOne(() => Venue, (venue) => venue.suitabilityTags)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  @Column()
  suitabilityName: string;
}
