export type Priority = 'High' | 'Medium' | 'Low';

export function computeLeadScore(budget: number): { score: number; priority: Priority } {
  if (budget > 20_000_000) return { score: 100, priority: 'High' };
  if (budget >= 10_000_000) return { score: 60, priority: 'Medium' };
  return { score: 20, priority: 'Low' };
}

export function formatBudget(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)}L`;
  return `PKR ${amount.toLocaleString()}`;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50 border-red-200';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'New': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Contacted': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'In Progress': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Closed': return 'text-green-600 bg-green-50 border-green-200';
    case 'Lost': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
