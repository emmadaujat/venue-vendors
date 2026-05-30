// ===========================================================
// Venue.ts — Entity representing the venue table in the database
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { VenueAmenities } from "./VenueAmenities";
import { VenueSuitabilityTag } from "./VenueSuitabilityTag";
import { VenueBlockedDates } from "./VenueBlockedDates";
import { Application } from "./Application";
import { SavedVenue } from "./SavedVenue";

@Entity()
export class Venue {
  // Auto-incremented primary key
  @PrimaryGeneratedColumn()
  venueID: number;

  // Foreign key — references the vendor (User) who owns this venue
  @ManyToOne(() => User, (user) => user.venues)
  @JoinColumn({ name: "vendorID" })
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

  @Column({ length: 1000 })
  shortDescription: string;

  @Column({ length: 500 })
  imageURL: string;

  @Column({ length: 50 })
  availabilityStatus: string;

  @Column({ default: false })
  isFeatured: boolean;

  // onDelete: "CASCADE" to the amenities, suitability tags and blocked dates relations
  // those child records delete automatically with the venue

  // A venue can have many amenities
  @OneToMany(() => VenueAmenities, (amenity) => amenity.venue, { cascade: true })
  amenities: VenueAmenities[];

  // A venue can have many suitability tags
  @OneToMany(() => VenueSuitabilityTag, (tag) => tag.venue, { cascade: true })
  suitabilityTags: VenueSuitabilityTag[];

  // A venue can have many blocked date ranges
  @OneToMany(() => VenueBlockedDates, (blocked) => blocked.venue, { cascade: true })
  blockedDates: VenueBlockedDates[];

  // A venue can have many applications
  @OneToMany(() => Application, (application) => application.venue)
  applications: Application[];

  @OneToMany(() => SavedVenue, (savedVenue) => savedVenue.venue)
  savedByUsers: SavedVenue[];
}
