// ===========================================================
// VenueAmenities.ts — Entity representing the venue amenitites table in the database
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Venue } from "./Venue";

@Entity()
export class VenueAmenities {
  // Auto-incremented primary key
  @PrimaryGeneratedColumn()
  amenityID: number;

  // Foreign key — references the venue who has these amenities
  @ManyToOne(() => Venue)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  // the name of the amenity
  @Column()
  amenityName: string;
}
