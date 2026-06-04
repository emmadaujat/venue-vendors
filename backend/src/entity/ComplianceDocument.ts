// ComplianceDocument.ts - stores hirer-uploaded compliance documents (insurance, licences, etc.).
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
  @PrimaryGeneratedColumn()
  complianceDocID: number;

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
