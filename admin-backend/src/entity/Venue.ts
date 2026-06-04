// Venue.ts - Venue entity. Owned by a vendor; has amenities, suitability tags, blocked dates, and applications.
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { VenueAmenities } from "./VenueAmenities";
import { VenueSuitabilityTag } from "./VenueSuitabilityTag";
import { VenueBlockedDates } from "./VenueBlockedDates";
import { Application } from "./Application";
import { SavedVenue } from "./SavedVenue";

@Entity()
export class Venue {
  @PrimaryGeneratedColumn()
  venueID: number;

  @ManyToOne(() => User, (user) => user.venues)
  @JoinColumn({ name: "vendorID" })
  vendor: User;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  capacity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  pricePerDay: number;

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

  // cascade: true causes TypeORM to persist/remove child rows when the venue is saved/removed.
  @OneToMany(() => VenueAmenities, (amenity) => amenity.venue, { cascade: true })
  amenities: VenueAmenities[];

  @OneToMany(() => VenueSuitabilityTag, (tag) => tag.venue, { cascade: true })
  suitabilityTags: VenueSuitabilityTag[];

  @OneToMany(() => VenueBlockedDates, (blocked) => blocked.venue, { cascade: true })
  blockedDates: VenueBlockedDates[];

  @OneToMany(() => Application, (application) => application.venue)
  applications: Application[];

  @OneToMany(() => SavedVenue, (savedVenue) => savedVenue.venue)
  savedByUsers: SavedVenue[];
}
