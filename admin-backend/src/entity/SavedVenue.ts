// SavedVenue.ts - a hirer's saved/preferred venue with a preference ranking order.
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Venue } from "./Venue";

@Entity()
export class SavedVenue {
  @PrimaryGeneratedColumn()
  savedVenueID: number;

  @ManyToOne(() => User, (user) => user.savedVenues)
  @JoinColumn({ name: "hirerID" })
  hirer: User;

  @ManyToOne(() => Venue, (venue) => venue.savedByUsers)
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  // 1 = most preferred; hirer can reorder their saved list.
  @Column()
  rankingOrder: number;
}
