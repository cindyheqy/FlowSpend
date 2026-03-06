import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Trash2, Pencil, Download, ArrowDownUp } from "lucide-react";
import { format } from "date-fns";
import { CATEGORIES } from "../components/spending/CategoryConfig";
import EditExpenseModal from "../components/spending/EditExpenseModal";
import PullToRefresh from "../components/spending/PullToRefresh";
// ... (see full source in repository)
