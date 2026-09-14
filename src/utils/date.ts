export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

export const translateStatus = (status?: string): string => {
  if (!status) return 'PENDING';

  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'MENUNGGU';
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'BERJALAN';
    case 'COMPLETED':
    case 'DONE':
      return 'SELESAI';
    case 'QC_HOLD':
      return 'QC HOLD';
    default:
      return status;
  }
};