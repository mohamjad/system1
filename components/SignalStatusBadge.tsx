'use client';

import { SignalStatus } from '@/types';

interface SignalStatusBadgeProps {
  status: SignalStatus;
}

export function SignalStatusBadge({ status }: SignalStatusBadgeProps) {
  const styles = {
    normal: 'status-normal',
    watch: 'status-watch',
    triggered: 'status-triggered'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
