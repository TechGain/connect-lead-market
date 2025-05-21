
/**
 * Email template generator for lead notifications
 */

/**
 * Generates HTML email content for new lead notifications
 */
export function generateLeadEmailHtml(
  lead: any,
  formattedPrice: string,
  creationDate: string,
  supabaseUrl: string
): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4338ca; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .lead-details { margin: 20px 0; }
          .lead-detail { margin-bottom: 10px; }
          .label { font-weight: bold; }
          .price { color: #059669; font-weight: bold; font-size: 1.2em; }
          .cta-button { 
            display: inline-block; 
            background-color: #4338ca; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
          }
          .footer { margin-top: 20px; font-size: 0.8em; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Lead Alert</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>A new lead has just been uploaded to the marketplace and is now available for purchase.</p>
            
            <div class="lead-details">
              <div class="lead-detail">
                <span class="label">Lead Type:</span> ${lead.type}
              </div>
              <div class="lead-detail">
                <span class="label">Location:</span> ${lead.location}
              </div>
              <div class="lead-detail">
                <span class="label">Price:</span> <span class="price">${formattedPrice}</span>
              </div>
              <div class="lead-detail">
                <span class="label">Description:</span> ${lead.description || 'No description provided'}
              </div>
              <div class="lead-detail">
                <span class="label">Date Added:</span> ${creationDate}
              </div>
              <div class="lead-detail">
                <span class="label">Seller:</span> ${lead.profiles?.full_name || 'Unknown'} ${lead.profiles?.company ? `(${lead.profiles.company})` : ''}
              </div>
            </div>
            
            <p>Don't miss out on this opportunity!</p>
            <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/marketplace" class="cta-button">View Lead in Marketplace</a>
          </div>
          <div class="footer">
            <p>You're receiving this email because you've enabled lead notifications. 
            You can manage your notification preferences in your profile settings.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates email subject for new lead notifications
 */
export function generateLeadEmailSubject(lead: any): string {
  return `New Lead Available: ${lead.type} in ${lead.location}`;
}
