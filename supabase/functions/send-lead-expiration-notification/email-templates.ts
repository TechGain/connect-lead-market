
/**
 * Email template generator for lead expiration notifications
 */

/**
 * Generates HTML email content for lead expiration warnings
 */
export function generateExpirationEmailHtml(
  lead: any,
  formattedPrice: string,
  sellerName: string,
  websiteUrl: string
): string {
  const dashboardUrl = `${websiteUrl}/my-leads`;
  
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .urgent { background-color: #fef2f2; border: 2px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9fafb; }
          .lead-details { margin: 20px 0; background-color: white; padding: 15px; border-radius: 5px; }
          .lead-detail { margin-bottom: 10px; }
          .label { font-weight: bold; }
          .price { color: #059669; font-weight: bold; font-size: 1.2em; }
          .appointment { color: #dc2626; font-weight: bold; font-size: 1.1em; }
          .contact-info { background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .cta-button { 
            display: inline-block; 
            background-color: #dc2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px;
            font-weight: bold;
          }
          .footer { margin-top: 20px; font-size: 0.8em; color: #6b7280; text-align: center; }
          .warning { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 URGENT: Lead Appointment Expiring Soon!</h1>
          </div>
          
          <div class="urgent">
            <h2 style="margin-top: 0; color: #dc2626;">⏰ Your lead appointment expires in 1 hour!</h2>
            <p style="margin-bottom: 0;"><strong>This is your final opportunity to connect with this buyer.</strong></p>
          </div>
          
          <div class="content">
            <p>Hello ${sellerName},</p>
            <p>Your lead appointment is scheduled to expire very soon. After the appointment time passes, 
            the buyer may be eligible for a refund if they report the lead as unsuccessful.</p>
            
            <div class="lead-details">
              <h3>Lead Details:</h3>
              <div class="lead-detail">
                <span class="label">Type:</span> ${lead.type}
              </div>
              <div class="lead-detail">
                <span class="label">Location:</span> ${lead.location}
              </div>
              <div class="lead-detail">
                <span class="label">Price:</span> <span class="price">${formattedPrice}</span>
              </div>
              <div class="lead-detail">
                <span class="label">Appointment Time:</span> <span class="appointment">${lead.appointment_time}</span>
              </div>
              ${lead.description ? `
              <div class="lead-detail">
                <span class="label">Description:</span> ${lead.description}
              </div>
              ` : ''}
            </div>
            
            <div class="contact-info">
              <h3>Buyer Contact Information:</h3>
              <div class="lead-detail">
                <span class="label">Name:</span> ${lead.contact_name || 'N/A'}
              </div>
              <div class="lead-detail">
                <span class="label">Email:</span> ${lead.contact_email || 'N/A'}
              </div>
              <div class="lead-detail">
                <span class="label">Phone:</span> ${lead.contact_phone || 'N/A'}
              </div>
              <div class="lead-detail">
                <span class="label">Buyer:</span> ${lead.buyer_name || 'N/A'}
              </div>
            </div>
            
            <div class="urgent">
              <h3 style="margin-top: 0;">🎯 Action Required:</h3>
              <ul>
                <li><strong>Contact the buyer immediately</strong> using the information above</li>
                <li><strong>Confirm or reschedule the appointment</strong> if needed</li>
                <li><strong>Ensure you're available</strong> for the scheduled appointment time</li>
                <li><strong>Follow up promptly</strong> to maximize conversion</li>
              </ul>
            </div>
            
            <p class="warning">⚠️ Remember: If the buyer doesn't hear from you or the appointment isn't successful, 
            they may request a refund for this lead.</p>
            
            <a href="${dashboardUrl}" class="cta-button">View Lead in Dashboard</a>
          </div>
          
          <div class="footer">
            <p>You're receiving this urgent notification because your lead appointment is about to expire. 
            Don't miss this opportunity!</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates email subject for lead expiration notifications
 */
export function generateExpirationEmailSubject(lead: any): string {
  return `🚨 URGENT: Your ${lead.type} lead in ${lead.location} expires in 1 hour!`;
}
