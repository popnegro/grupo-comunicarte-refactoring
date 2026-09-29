import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  X,
  Search,
  FilterX,
  Sparkles,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Save,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { StatusBadge } from '../../components/dashboard/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { calculateSupportTotal, formatSupportCurrency } from '../../lib/supportPricing';
import {
  downloadMediaKitPdf,
  downloadMediaKitPpt,
  sendMediaKitToLead,
  ExportSupport,
} from '../../lib/adminMediaKitExport';

// TEMPORARY STUB - full restore in progress
export default function DashboardMediaKitWorkflow() {
  return (
    <DashboardShell>
      <div className="p-6 text-sm text-red-700">
        Media Kit workflow temporalmente no disponible. Restauración en curso.
      </div>
    </DashboardShell>
  );
}
