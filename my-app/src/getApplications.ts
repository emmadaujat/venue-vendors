import { DEFAULT_APPLICATIONS } from "@/dummyData";
import type { Application } from "@/types";

// grabs all applications - combines the dummy data with any new ones
// the hirer submitted, and applies vendor approve/decline updates
export function getAllApplications(): Application[] {
  let allApps = [...DEFAULT_APPLICATIONS];

  // check if hirer submitted new applications through the form
  const storedHirerApps = localStorage.getItem("hirerApplications");
  if (storedHirerApps) {
    const parsed = JSON.parse(storedHirerApps);
    parsed.forEach((app: Application) => {
      if (!allApps.find((a) => a.id === app.id)) {
        allApps.push(app);
      }
    });
  }

  // check if vendor changed any statuses (approved/declined)
  const storedStatuses = localStorage.getItem("applicationStatuses");
  if (storedStatuses) {
    const statusMap = JSON.parse(storedStatuses);
    allApps = allApps.map((a) => ({
      ...a,
      status: statusMap[a.id] ?? a.status,
    }));
  }

  return allApps;
}
