// VenueBlockedDates.ts - a blocked date range on a venue (for maintenance, private holds, etc.).
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Venue } from "./Venue";

@Entity()
export class VenueBlockedDates {
  @PrimaryGeneratedColumn()
  blockedID: number;

  @ManyToOne(() => Venue, (venue) => venue.blockedDates, { nullable: true })
  @JoinColumn({ name: "venueID" })
  venue: Venue;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  reason: string;
}
