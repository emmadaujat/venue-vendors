// Booking.ts - a confirmed booking created when a vendor approves an Application.
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Application } from "./Application";
import { VendorComment } from "./VendorComment";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  bookingID: number;

  @OneToOne(() => Application, (application) => application.booking)
  @JoinColumn({ name: "applicationID" })
  application: Application;

  @Column({ nullable: true })
  vendorRating: number;

  @Column({ nullable: true })
  hirerReputationRating: number;

  @Column({ length: 20, default: "active" })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => VendorComment, (comment) => comment.booking)
  vendorComments: VendorComment[];
}
