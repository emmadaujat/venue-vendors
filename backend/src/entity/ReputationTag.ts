// ===========================================================
// ReputationTag.ts — Look up entity to look up reputation tags for an application
// Tags a hirer selects about themselves when submitting an application
// ===========================================================

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { HirerReputationTag } from "./HirerReputationTag";

@Entity()
export class ReputationTag {
  @PrimaryGeneratedColumn()
  reputationID: number;

  @Column()
  reputationName: string;

  // One tag can be selected across many applications
  @OneToMany(() => HirerReputationTag, (hirerTag) => hirerTag.reputationTag)
  hirerReputationTags: HirerReputationTag[];
}
