import { z } from "zod";

import { REPORT_RANGES } from "@/types/report";

export const reportRangeSchema = z.enum(REPORT_RANGES).default("7d");
