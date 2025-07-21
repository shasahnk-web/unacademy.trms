// Database configuration for Supabase connection via Drizzle
export const supabaseConfig = {
  url: 'https://fmrvnfvmoxontvqxbwoo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcnZuZnZtb3hvbnR2cXhid29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzI5MjcsImV4cCI6MjA2ODY0ODkyN30.ORcfRPHkARgBTey3R37ggM_Zxk1yvzQx60DBs7K_tBY'
};

// Helper function to determine batch status
export function getBatchStatus(batch: any): 'active' | 'completed' | 'upcoming' {
  const now = new Date();
  const startsAt = batch.startsAt ? new Date(batch.startsAt) : null;
  const completedAt = batch.completedAt ? new Date(batch.completedAt) : null;
  
  if (completedAt && completedAt < now) {
    return 'completed';
  } else if (startsAt && startsAt > now) {
    return 'upcoming';
  } else {
    return 'active';
  }
}

// Helper function to format date ranges
export function formatDateRange(startsAt: string | null, completedAt: string | null): string {
  if (!startsAt && !completedAt) return 'Date not specified';
  
  const start = startsAt ? new Date(startsAt) : null;
  const end = completedAt ? new Date(completedAt) : null;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric',
      day: 'numeric'
    });
  };
  
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  } else if (start) {
    return `Starting ${formatDate(start)}`;
  } else if (end) {
    return `Until ${formatDate(end)}`;
  }
  
  return 'Date not specified';
}

// Helper function to get teacher initials for avatars
export function getTeacherInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Helper function to get exam icon
export function getExamIcon(exam: string): string {
  if (exam?.toLowerCase().includes('neet')) return 'fas fa-flask';
  if (exam?.toLowerCase().includes('jee') || exam?.toLowerCase().includes('iit')) return 'fas fa-atom';
  if (exam?.toLowerCase().includes('gate') || exam?.toLowerCase().includes('ese')) return 'fas fa-cogs';
  if (exam?.toLowerCase().includes('judiciary')) return 'fas fa-gavel';
  if (exam?.toLowerCase().includes('upsc')) return 'fas fa-landmark';
  if (exam?.toLowerCase().includes('ssc')) return 'fas fa-briefcase';
  return 'fas fa-book';
}

// Helper function to get exam color
export function getExamColor(exam: string): string {
  if (exam?.toLowerCase().includes('neet')) return 'bg-green-100 text-green-600';
  if (exam?.toLowerCase().includes('jee') || exam?.toLowerCase().includes('iit')) return 'bg-blue-100 text-blue-600';
  if (exam?.toLowerCase().includes('gate') || exam?.toLowerCase().includes('ese')) return 'bg-purple-100 text-purple-600';
  if (exam?.toLowerCase().includes('judiciary')) return 'bg-red-100 text-red-600';
  if (exam?.toLowerCase().includes('upsc')) return 'bg-indigo-100 text-indigo-600';
  if (exam?.toLowerCase().includes('ssc')) return 'bg-orange-100 text-orange-600';
  return 'bg-gray-100 text-gray-600';
}
