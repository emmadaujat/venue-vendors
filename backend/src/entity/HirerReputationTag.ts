// ===========================================================
// HirerReputationTag.ts — Entity representing the HirerReputationTag table in the database
// Tags a hirer selects about themselves when submitting an application
// ===========================================================

import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Application } from "./Application";
import { ReputationTag } from "./ReputationTag";

@Entity()
export class HirerReputationTag {
  // Composite primary key — applicationID + reputationID together are unique
  @PrimaryColumn({ nullable: false })
  reputationID: number;

  @PrimaryColumn({ nullable: false })
  applicationID: number;

  // Foreign key — references the application these tags belong to
  // Many tags can belong to one application
  @ManyToOne(() => Application, (application) => application.reputationTags)
  @JoinColumn({ name: "applicationID" })
  application: Application;

  // Many HirerReputationTag rows can reference one ReputationTag
  @ManyToOne(() => ReputationTag)
  @JoinColumn({ name: "reputationID" })
  reputationTag: ReputationTag;
}
