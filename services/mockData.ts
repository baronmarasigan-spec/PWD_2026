
import { Application, ApplicationStatus, ApplicationType, CashGrant, CashGrantStatus, Complaint, RegistryRecord, Role, User, EventItem, PosterItem } from '../types';

// Helper to generate a date relative to today for mock data consistency
const getRelativeDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const MALE_AVATAR = 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png';
const FEMALE_AVATAR = 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png';

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_POSTERS: PosterItem[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 'a1',
    name: 'PWD Admin Officer',
    role: Role.ADMIN,
    email: 'admin@gov.ph',
    avatarUrl: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png',
    username: 'admin',
    password: 'asd'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [];

export const INITIAL_COMPLAINTS: Complaint[] = [];

export const INITIAL_REGISTRY_RECORDS: RegistryRecord[] = [];

export const INITIAL_CASH_GRANTS: CashGrant[] = [];


