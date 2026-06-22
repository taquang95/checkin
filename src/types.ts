export interface CheckInRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  timestamp: string;
  synced: boolean;
  notes?: string;
}

export interface AppConfig {
  scriptUrl: string;
  eventName: string;
  eventDate: string;
  logoType: 'default' | 'tech' | 'store' | 'custom';
  customLogoUrl?: string;
  themeColor: string;
}
