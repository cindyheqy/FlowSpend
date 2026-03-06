import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths, subMonths, isAfter, endOfDay } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { SlidersHorizontal, ChevronRight, ChevronLeft, Plus, BookOpen, X, Pencil, Check } from "lucide-react";
import MonthSummaryBar from "../components/spending/MonthSummaryBar";
import PullToRefresh from "../components/spending/PullToRefresh";
import CategoryDrawer from "../components/spending/CategoryDrawer";
import EditExpenseModal from "../components/spending/EditExpenseModal";
import BudgetSettings from "../components/spending/BudgetSettings";
import ReflectionModal from "../components/spending/ReflectionModal";
// ... (see full source in repository)
