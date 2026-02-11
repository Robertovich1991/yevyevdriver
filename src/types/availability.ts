/**
 * Availability types for the scheduling feature
 */

export interface Availability {
  id: number;
  userId: number;
  date: string; // Format: "YYYY-MM-DD"
  slotStatuses: { [time: string]: AvailabilityStatus }; // Map of time strings (HH:mm) to status
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility (may be present in API responses)
  timeSlots?: string[];
  availability?: AvailabilityStatus;
}

export type AvailabilityStatus = 'available' | 'not-available' | 'conditional';

export interface AvailabilityCreatePayload {
  userId: number;
  date: string;
  slotStatuses: { [time: string]: AvailabilityStatus };
}

export interface AvailabilityUpdatePayload {
  userId?: number;
  date?: string;
  slotStatuses?: { [time: string]: AvailabilityStatus };
}

export interface AvailabilityListResponse {
  availabilities: Availability[];
}

export interface AvailabilitySingleResponse {
  availability: Availability;
}

export interface AvailabilityCreateResponse {
  availabilities: Availability | Availability[];
}

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type WeekPattern = Record<WeekdayKey, { [time: string]: AvailabilityStatus }>;

export interface AvailabilityTemplate {
  id: number;
  userId: number;
  name: string;
  weekPattern: WeekPattern;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilityTemplateListResponse {
  templates: AvailabilityTemplate[];
}

export interface AvailabilityTemplateSingleResponse {
  template: AvailabilityTemplate;
}

export interface AvailabilityTemplateApplyResult {
  created: number;
  updated: number;
  skipped: number;
}

export const WEEKDAY_KEYS: WeekdayKey[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

// Time period definitions
export const TIME_PERIODS = {
  morning: {
    label: 'Morning',
    startSlot: 12, // 06:00
    endSlot: 23,   // 11:30
  },
  afternoon: {
    label: 'Afternoon',
    startSlot: 24, // 12:00
    endSlot: 35,   // 17:30
  },
  evening: {
    label: 'Evening',
    startSlot: 36, // 18:00
    endSlot: 47,   // 23:30
  },
} as const;

// Time slot utilities
export const SLOT_START = 12; // 06:00 (slot 12 = 12 * 30 = 360 mins = 6 hours)
export const SLOT_END = 47;   // 23:30
export const TOTAL_SLOTS = SLOT_END - SLOT_START + 1; // 36 slots

/**
 * Convert slot number to time string (HH:mm)
 */
export const slotToTime = (slot: number): string => {
  const mins = slot * 30;
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Convert time string to slot number
 */
export const timeToSlot = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return Math.floor((h * 60 + m) / 30);
};

/**
 * Convert array of slot numbers to time strings
 */
export const slotsToTimes = (slots: number[]): string[] => {
  return slots.map(slotToTime);
};

/**
 * Convert array of time strings to slot numbers
 */
export const timesToSlots = (times: string[]): number[] => {
  return times.map(timeToSlot).sort((a, b) => a - b);
};

/**
 * Get all slot numbers for a time period
 */
export const getPeriodSlots = (period: keyof typeof TIME_PERIODS): number[] => {
  const { startSlot, endSlot } = TIME_PERIODS[period];
  const slots: number[] = [];
  for (let i = startSlot; i <= endSlot; i++) {
    slots.push(i);
  }
  return slots;
};

/**
 * Get all available slots (06:00 - 23:30)
 */
export const getAllSlots = (): number[] => {
  const slots: number[] = [];
  for (let i = SLOT_START; i <= SLOT_END; i++) {
    slots.push(i);
  }
  return slots;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get status color
 */
export const getStatusColor = (status: AvailabilityStatus): string => {
  switch (status) {
    case 'available':
      return '#38AA35';
    case 'not-available':
      return '#FF3B30';
    case 'conditional':
      return '#FF9500';
    default:
      return '#575757';
  }
};

/**
 * Get status label
 */
export const getStatusLabel = (status: AvailabilityStatus): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'not-available':
      return 'Not Available';
    case 'conditional':
      return 'Conditional';
    default:
      return status;
  }
};
