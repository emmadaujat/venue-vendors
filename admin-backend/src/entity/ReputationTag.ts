// ReputationTag.ts - lookup table for the available reputation tags hirers can self-select.
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { HirerReputationTag } from "./HirerReputationTag";

@Entity()
export class ReputationTag {
  @PrimaryGeneratedColumn()
  reputationID: number;

  @Column()
  reputationName: string;

  @OneToMany(() => HirerReputationTag, (hirerTag) => hirerTag.reputationTag)
  hirerReputationTags: HirerReputationTag[];
}
