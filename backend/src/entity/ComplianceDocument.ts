// ===========================================================
// ComplianceDocument.ts — Entity representing the ComplianceDocument table in the database
// A hirer can upload up to 4 compliance documents
// ===========================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class ComplianceDocument {
  // Auto-incremented primary key
  @PrimaryGeneratedColumn()
  complianceDocID: number;

  // Foreign key — references the hirer who uploaded this document
  // Many documents can belong to one hirer (up to 4)
  @ManyToOne(() => User, (user) => user.complianceDocuments)
  @JoinColumn({ name: "hirerID" })
  hirer: User;

  @Column()
  documentType: string;

  @Column()
  fileName: string;

  @CreateDateColumn()
  uploadedAt: Date;

  // Stores the file as a base64 string so vendors can download it.
  // type:'text' maps to nvarchar(max) in SQL Server, which holds up to 2 GB.
  @Column({ type: 'text', nullable: true })
  fileURL: string;

  @Column({ default: false })
  isBusiness: boolean;

  @Column({ nullable: true })
  abnNumber: string;
}
