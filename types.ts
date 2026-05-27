export enum Role {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ENCODER = 'ENCODER',
  APPROVER = 'APPROVER',
  MERCHANT = 'MERCHANT',
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  SCHEDULED = 'Scheduled',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ISSUED = 'Issued',
}

export enum ApplicationType {
  REGISTRATION = 'Registration',
  ID_NEW = 'New PWD ID',
  ID_RENEWAL = 'PWD ID Renewal',
  ID_REPLACEMENT = 'PWD ID Replacement',
  BENEFIT_CASH = 'Cash Grant',
}

export enum CashGrantStatus {
  ELIGIBLE = 'Eligible',
  REVIEWED = 'Reviewed',
  DISTRIBUTING = 'Distributing',
  CLAIMED = 'Claimed',
  UNCLAIMED = 'Unclaimed',
  FOLLOW_UP = 'For follow up',
}

export interface CashGrant {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  year: number;
  status: CashGrantStatus;
  dateGenerated: string;
  dateUpdated: string;
  isWalkIn?: boolean;
  remarks?: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  role: Role;
  email: string;
  avatarUrl?: string;
  birthDate?: string; // ISO string
  address?: string;
  pwdIdNumber?: string; // Updated from seniorIdNumber
  pwdIdIssueDate?: string; // ISO string
  pwdIdExpiryDate?: string; // ISO string
  contactNumber?: string;
  emergencyContact?: string; 
  emergencyContactPerson?: string;
  emergencyContactNumber?: string;
  username?: string; 
  password?: string;
  
  // Extended Profile Fields
  sex?: string;
  gender?: string; // Added
  civilStatus?: string;
  birthPlace?: string;
  citizenship?: string;
  livingArrangement?: string;
  isPensioner?: boolean;
  pensionAmount?: string;
  pensionSource?: string;
  hasIllness?: boolean;
  illnessDetails?: string;
  bloodType?: string;
  joinFederation?: boolean;
  disabilityType?: string; // Added for PWD
  isDeceased?: boolean;
  registrationDate?: string; // ISO string
  
  // New PWD Fields
  controlNo?: string;
  dateApplied?: string;
  officeUnit?: string;
  typeOfDisability?: string;
  causeOfDisability?: string;
  streetAddress?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  landline?: string;
  mobileNumber?: string;
  emailAddress?: string;
  emergencyContactRelationship?: string;
  highestEducation?: string;
  employmentStatus?: string;
  employmentType?: string;
  employmentCategory?: string;
  occupation?: string;
  orgName?: string;
  orgContactPerson?: string;
  orgAddress?: string;
  orgContactNo?: string;
  sssNumber?: string;
  gsisNumber?: string;
  pagIbigNumber?: string;
  psnNumber?: string;
  philHealthNumber?: string;
  fatherName?: string;
  fatherLastName?: string;
  fatherFirstName?: string;
  fatherMiddleName?: string;
  motherName?: string;
  motherLastName?: string;
  motherFirstName?: string;
  motherMiddleName?: string;
  guardianName?: string;
  guardianLastName?: string;
  guardianFirstName?: string;
  guardianMiddleName?: string;
  physicianName?: string;
  physicianLicense?: string;
  governmentIds?: string[];
  accomplishedBy?: string;
  accomplishedByLastName?: string;
  accomplishedByFirstName?: string;
  accomplishedByMiddleName?: string;
}

export interface Application {
  id: string;
  userId: string;
  userName: string;
  type: ApplicationType;
  date: string;
  status: ApplicationStatus;
  description: string;
  documents?: string[]; 
  rejectionReason?: string;
  appointmentDate?: string;
  reviewedDate?: string;
  
  // Captured Form Data for ID
  formData?: {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    birthDate: string;
    birthPlace?: string;
    sex?: string;
    gender?: string;
    citizenship?: string;
    civilStatus: string;
    address?: string;
    houseNo?: string;
    street?: string;
    barangay?: string;
    district?: string;
    city?: string;
    province?: string;
    contactNumber: string;
    email?: string;
    processingOfficer?: string;
    approvingOfficer?: string;
    emergencyContactPerson: string;
    emergencyContactNumber: string;
    joinFederation?: boolean;
    capturedImage?: string;
    isWalkIn?: boolean;
    livingArrangement?: string;
    isPensioner?: boolean;
    pensionSource?: string;
    pensionAmount?: string;
    hasIllness?: boolean;
    illnessDetails?: string;
    disabilityType?: string; // Added for PWD
    
    // New PWD Fields
    controlNo?: string;
    dateApplied?: string;
    officeUnit?: string;
    typeOfDisability?: string;
    causeOfDisability?: string;
    streetAddress?: string;
    cityMunicipality?: string;
    region?: string;
    landline?: string;
    mobileNumber?: string;
    emailAddress?: string;
    relationship?: string;
    highestEducation?: string;
    employmentStatus?: string;
    employmentType?: string;
    employmentCategory?: string;
    occupation?: string;
    orgName?: string;
    orgContactPerson?: string;
    orgAddress?: string;
    orgContactNo?: string;
    sssNumber?: string;
    gsisNumber?: string;
    pagIbigNumber?: string;
    psnNumber?: string;
    philHealthNumber?: string;
    fatherName?: string;
    fatherLastName?: string;
    fatherFirstName?: string;
    fatherMiddleName?: string;
    motherName?: string;
    motherLastName?: string;
    motherFirstName?: string;
    motherMiddleName?: string;
    guardianName?: string;
    guardianLastName?: string;
    guardianFirstName?: string;
    guardianMiddleName?: string;
    physicianName?: string;
    physicianLicense?: string;
    governmentIds?: string[];
    accomplishedBy?: string;
    accomplishedByLastName?: string;
    accomplishedByFirstName?: string;
    accomplishedByMiddleName?: string;
  };
  user?: User; // Added for convenience in UI
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  date: string;
  subject: string;
  details: string;
  status: 'Open' | 'Resolved';
  aiSummary?: string; 
  adminResponse?: string;
}

export interface RegistryRecord {
  id: string; 
  type: 'LCR' | 'PWD';
  pwdIdNumber?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  citizenship?: string;
  birthDate: string;
  birthPlace?: string; 
  sex?: string;
  civilStatus?: string;
  province?: string;
  city?: string;
  district?: string;
  barangay?: string;
  street?: string;
  houseNo?: string;
  address?: string; 
  isRegistered: boolean; 
  isDeceased?: boolean;
  isSenior?: boolean;
  isWalkIn?: boolean;
  avatarUrl?: string; // Added for visual identification
  disabilityType?: string; // Added for PWD
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  image?: string;
  createdAt?: any;
}

export interface PosterItem {
  id: string;
  title: string;
  image: string;
  date?: string;
  createdAt?: any;
}
