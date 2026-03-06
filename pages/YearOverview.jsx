import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ChevronLeft, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { CATEGORIES } from "../components/spending/CategoryConfig";
// ... (see full source in repository)
