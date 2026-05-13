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

export const AppDataSource = new DataSource({
  type: "mssql",
  host: "dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com",
  username: "s4151401",
  password: "fsd/s1/2026",
  database: "s4151401",
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
  ],
  migrations: [],
  subscribers: [],
});
