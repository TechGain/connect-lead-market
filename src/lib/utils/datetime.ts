/**
 * Utility functions for date and time operations
 */

import { format, parse, isAfter, isBefore, differenceInHours, differenceInMinutes } from 'date-fns';

/**
 * Checks if an appointment time string has passed the current time
 * @param appointmentTimeStr The appointment time string in the format "Month Day, Year at Time Slot"
 * @returns true if the appointment time has passed, false otherwise
 */
export function isAppointmentPassed(appointmentTimeStr: string | null | undefined): boolean {
  if (!appointmentTimeStr) {
    return false;
  }
  
  try {
    // Extract date and time parts from the appointment string
    const dateTimeRegex = /^(.*?) at (.*)$/;
    const match = appointmentTimeStr.match(dateTimeRegex);
    
    if (!match || match.length < 3) {
      console.warn('Invalid appointment time format:', appointmentTimeStr);
      return false;
    }
    
    const [_, datePart, timePart] = match;
    
    // Parse the date part
    let appointmentDate: Date;
    try {
      // Try to parse with date-fns
      appointmentDate = parse(datePart, 'PPP', new Date());
    } catch (e) {
      console.error('Failed to parse appointment date:', datePart, e);
      return false;
    }
    
    // Handle the time part - we'll use the end time of the slot for comparison
    // Example time slots: "8:00 AM - 10:00 AM", "4:00 PM - 6:00 PM"
    const timeRegex = /(\d+:\d+\s*[AP]M)\s*-\s*(\d+:\d+\s*[AP]M)/i;
    const timeMatch = timePart.match(timeRegex);
    
    if (!timeMatch || timeMatch.length < 3) {
      console.warn('Invalid time slot format:', timePart);
      return false;
    }
    
    // Use the end time of the time slot
    const endTimeStr = timeMatch[2];
    
    // Create a full datetime string and parse it
    const fullDateTimeStr = `${datePart} ${endTimeStr}`;
    let appointmentDateTime: Date;
    
    try {
      // Parse the full date and time
      appointmentDateTime = parse(fullDateTimeStr, 'PPP h:mm a', new Date());
    } catch (e) {
      console.error('Failed to parse appointment date and time:', fullDateTimeStr, e);
      return false;
    }
    
    // Compare with the current time
    const now = new Date();
    return isBefore(appointmentDateTime, now);
  } catch (error) {
    console.error('Error checking if appointment has passed:', error);
    return false;
  }
}

/**
 * Format date to a human-readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return format(date, 'PPP');
}

/**
 * Calculates the time remaining before the 48-hour confirmation period expires
 * @param purchasedAt The timestamp when the lead was purchased
 * @returns Object containing hours and minutes remaining, or null if invalid
 */
export function getConfirmationTimeRemaining(purchasedAt: string | null | undefined): { hours: number; minutes: number } | null {
  if (!purchasedAt) {
    return null;
  }
  
  try {
    const purchaseDate = new Date(purchasedAt);
    const now = new Date();
    
    // Calculate the expiration date (48 hours after purchase)
    const expirationDate = new Date(purchaseDate);
    expirationDate.setHours(expirationDate.getHours() + 48);
    
    // If expiration time has passed, return zeros
    if (isAfter(now, expirationDate)) {
      return { hours: 0, minutes: 0 };
    }
    
    // Calculate remaining time
    const hours = differenceInHours(expirationDate, now);
    const minutes = differenceInMinutes(expirationDate, now) % 60;
    
    return { hours, minutes };
  } catch (error) {
    console.error('Error calculating confirmation time remaining:', error);
    return null;
  }
}

/**
 * Formats the remaining time as a string in the format "HH:MM"
 * @param timeRemaining Object containing hours and minutes
 * @returns Formatted time string or empty string if invalid
 */
export function formatTimeRemaining(timeRemaining: { hours: number; minutes: number } | null): string {
  if (!timeRemaining) {
    return '';
  }
  
  const { hours, minutes } = timeRemaining;
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}`;
}

/**
 * Generates a Google Calendar URL for adding an event
 * @param appointmentTimeStr The appointment time string in the format "Month Day, Year at Time Slot"
 * @param title Title for the calendar event
 * @param description Description for the calendar event
 * @param location Location for the calendar event
 * @returns URL string for Google Calendar event creation
 */
export function generateGoogleCalendarUrl(
  appointmentTimeStr: string | undefined,
  title: string,
  description: string = '',
  location: string = ''
): string | null {
  if (!appointmentTimeStr) {
    return null;
  }
  
  try {
    // Extract date and time parts from the appointment string
    const dateTimeRegex = /^(.*?) at (.*)$/;
    const match = appointmentTimeStr.match(dateTimeRegex);
    
    if (!match || match.length < 3) {
      console.warn('Invalid appointment time format:', appointmentTimeStr);
      return null;
    }
    
    const [_, datePart, timePart] = match;
    
    // Parse the date part
    let appointmentDate: Date;
    try {
      appointmentDate = parse(datePart, 'PPP', new Date());
    } catch (e) {
      console.error('Failed to parse appointment date:', datePart, e);
      return null;
    }
    
    // Handle the time part - we'll use both start and end times
    // Example time slots: "8:00 AM - 10:00 AM", "4:00 PM - 6:00 PM"
    const timeRegex = /(\d+:\d+\s*[AP]M)\s*-\s*(\d+:\d+\s*[AP]M)/i;
    const timeMatch = timePart.match(timeRegex);
    
    if (!timeMatch || timeMatch.length < 3) {
      console.warn('Invalid time slot format:', timePart);
      return null;
    }
    
    const startTimeStr = timeMatch[1];
    const endTimeStr = timeMatch[2];
    
    // Create full datetime strings and parse them
    const startDateTimeStr = `${datePart} ${startTimeStr}`;
    const endDateTimeStr = `${datePart} ${endTimeStr}`;
    
    let startDateTime: Date, endDateTime: Date;
    
    try {
      startDateTime = parse(startDateTimeStr, 'PPP h:mm a', new Date());
      endDateTime = parse(endDateTimeStr, 'PPP h:mm a', new Date());
    } catch (e) {
      console.error('Failed to parse appointment start/end times:', e);
      return null;
    }
    
    // Format dates for Google Calendar URL (ISO format)
    const startIso = startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    const endIso = endDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    
    // Encode the parameters for the URL
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: encodeURIComponent(title),
      dates: `${startIso}/${endIso}`,
      details: encodeURIComponent(description),
      location: encodeURIComponent(location),
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (error) {
    console.error('Error generating Google Calendar URL:', error);
    return null;
  }
}
