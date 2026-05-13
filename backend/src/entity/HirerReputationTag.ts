// ===========================================================
// HirerReputationTag.ts — Entity representing the HirerReputationTag table in the database
// Tags a hirer selects about themselves when submitting an application
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Application } from "./Application";

@Entity()
export class HirerReputationTag {
  // Auto-incremented primary key
  @PrimaryGeneratedColumn()
  reputationID: number;

  // Foreign key — references the application these tags belong to
  // Many tags can belong to one application
  @ManyToOne(() => Application, (application) => application.reputationTags)
  @JoinColumn({ name: "applicationID" })
  application: Application;

  @Column()
  reputationName: string;
}
