// ===========================================================
// Booking.ts — Entity representing the bookings table in the database
// ===========================================================
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Application } from "./Application";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  bookingID: number;

  @OneToOne(() => Application, { nullable: true })
  @JoinColumn({ name: "applicationID" })
  application: Application;

  @Column({ nullable: true })
  vendorRating: number;

  @Column()
  status: string;

  @Column()
  createdAt: Date;
}
