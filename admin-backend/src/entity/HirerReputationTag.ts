// HirerReputationTag.ts - junction table linking an Application to the ReputationTags a hirer selected.
// Composite primary key (applicationID + reputationID) enforces uniqueness per application.

import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { Application } from "./Application";
import { ReputationTag } from "./ReputationTag";

@Entity()
export class HirerReputationTag {
  @PrimaryColumn({ nullable: false })
  reputationID: number;

  @PrimaryColumn({ nullable: false })
  applicationID: number;

  @ManyToOne(() => Application, (application) => application.reputationTags)
  @JoinColumn({ name: "applicationID" })
  application: Application;

  @ManyToOne(() => ReputationTag)
  @JoinColumn({ name: "reputationID" })
  reputationTag: ReputationTag;
}
