import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Venue } from "./entity/Venue";
import { VenueAmenities } from "./entity/VenueAmenities";
import { VenueSuitabilityTag } from "./entity/VenueSuitabilityTag";
import { VenueBlockedDates } from "./entity/VenueBlockedDates";
import { Application } from "./entity/Application";
import { Booking } from "./entity/Booking";
import { VendorComment } from "./entity/VendorComment";
import { ComplianceDocument } from "./entity/ComplianceDocument";
import { HirerReputationTag } from "./entity/HirerReputationTag";
import { SavedVenue } from "./entity/SavedVenue";
import { ReputationTag } from "./entity/ReputationTag";
import "dotenv/config";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
  },
  synchronize: true, // auto-creates tables – disable in production
  logging: true,
  entities: [
    User,
    Venue,
    VenueAmenities,
    VenueSuitabilityTag,
    VenueBlockedDates,
    Application,
    Booking,
    VendorComment,
    ComplianceDocument,
    HirerReputationTag,
    SavedVenue,
    ReputationTag,
  ],
  migrations: [],
  subscribers: [],
});
