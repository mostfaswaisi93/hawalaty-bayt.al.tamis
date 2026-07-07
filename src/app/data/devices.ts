export interface Device {
  id: string;
  name: string;
  browser: string;
  icon: string;
  locationKey: string;
  lastActiveKey: string;
  isCurrent: boolean;
}

export const MOCK_DEVICES: Device[] = [
  { id: 'DEV-01', name: 'iPhone 15 Pro', browser: 'Safari', icon: 'smartphone', locationKey: 'devices.locations.baghdad', lastActiveKey: 'devices.activity.now', isCurrent: true },
  { id: 'DEV-02', name: 'Windows PC', browser: 'Chrome', icon: 'laptop_mac', locationKey: 'devices.locations.baghdad', lastActiveKey: 'devices.activity.hoursAgo', isCurrent: false },
  { id: 'DEV-03', name: 'Samsung Galaxy S23', browser: 'Chrome', icon: 'smartphone', locationKey: 'devices.locations.basra', lastActiveKey: 'devices.activity.yesterday', isCurrent: false },
];
