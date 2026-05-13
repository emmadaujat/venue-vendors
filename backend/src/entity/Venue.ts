// ===========================================================
// Venue.ts — Entity representing the venue table in the database
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { VenueAmenities } from "./VenueAmenities";
import { VenueSuitabilityTag } from "./VenueSuitabilityTag";
import { VenueBlockedDates } from "./VenueBlockedDates";
import { Application } from "./Application";

@Entity()
export class Venue {
  // Auto-incremented primary key
  @PrimaryGeneratedColumn()
  venueID: number;

  // Foreign key — references the vendor (User) who owns this venue
  @ManyToOne(() => User, (user) => user.venues)
  @JoinColumn({ name: "userID" })
  vendor: User;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  // Precision = total number of digits
  // Scale = number of digits after the decimal point
  @Column("decimal", { precision: 10, scale: 2 })
  pricePerDay: number;

  // Rating stored as decimal e.g. 4.7
  @Column("decimal", { precision: 3, scale: 1 })
  rating: number;

  @Column()
  reviewCount: number;

  @Column("text")
  shortDescription: string;

  @Column()
  imageURL: string;

  @Column()
  availabilityStatus: string;

  // A venue can have many amenities
  @OneToMany(() => VenueAmenities, (amenity) => amenity.venue)
  amenities: VenueAmenities[];

  // A venue can have many suitability tags
  @OneToMany(() => VenueSuitabilityTag, (tag) => tag.venue)
  suitabilityTags: VenueSuitabilityTag[];

  // A venue can have many blocked date ranges
  @OneToMany(() => VenueBlockedDates, (blocked) => blocked.venue)
  blockedDates: VenueBlockedDates[];

  // A venue can have many applications
  @OneToMany(() => Application, (application) => application.venue)
  applications: Application[];
}
