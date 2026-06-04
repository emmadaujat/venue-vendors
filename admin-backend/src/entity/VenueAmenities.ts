// VenueAmenities.ts - one amenity row per amenity per venue (e.g. "WiFi", "Parking").
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Venue } from "./Venue";

@Entity()
export class VenueAmenities {
  @PrimaryGeneratedColumn()
  amenityID: number;

  @ManyToOne(() => Venue, (venue) => venue.amenities)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  @Column()
  amenityName: string;
}
