export interface PistachioPrice {
  id: number;
  variety: string;
  size: string;
  today_price: number;
  yesterday_price: number;
  weekly_change: number;
  weekly_change_percent: number;
  trend: "up" | "down" | "flat";
  is_visible: boolean;
  sort_order: number;
  source?: string | null;
  updated_at: string;
}

export interface DashboardMetric {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  subtitle?: string;
}
