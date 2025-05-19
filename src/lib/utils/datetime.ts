
/**
 * Utility functions for date and time operations
 */

import { format, parse, isAfter, isBefore } from 'date-fns';

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

