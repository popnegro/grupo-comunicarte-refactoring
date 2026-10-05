import { useMemo, useState } from 'react';

export type WorkflowStatus = 'request' | 'in_progress' | 'done';

export type LeadRequest = {
  id: string;
  requestId: string;
  clientName: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  status: WorkflowStatus;
  supportIds: string[];
  supportNames: string[];
  createdAt: string;
};

export type LeadFilter = 'all' | WorkflowStatus;

export function useMediaKitLeadFilters(leads: LeadRequest[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<LeadFilter>('all');

  const counts = useMemo(
    () => ({
      all: leads.length,
      request: leads.filter((x) => x.status === 'request').length,
      in_progress: leads.filter((x) => x.status === 'in_progress').length,
      done: leads.filter((x) => x.status === 'done').length,
    }),
    [leads],
  );

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((item) => {
      const matchStatus = filter === 'all' || item.status === filter;
      const matchQuery =
        !q ||
        [item.clientName, item.company, item.email, item.phone, item.requestId, ...item.supportNames].some((val) =>
          String(val || '').toLowerCase().includes(q),
        );
      return matchStatus && matchQuery;
    });
  }, [leads, filter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  const hasActiveFilters = filter !== 'all' || searchQuery.trim().length > 0;

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    counts,
    visible,
    clearFilters,
    hasActiveFilters,
  };
}
