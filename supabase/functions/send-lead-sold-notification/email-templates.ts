
/**
 * Email template generator for lead sold notifications to sellers
 */

/**
 * Generates HTML email content for lead sold notifications to sellers
 */
export function generateLeadSoldEmailHtml(
  lead: any,
  seller: any,
  buyer: any,
  formattedPrice: string,
  saleDate: string,
  websiteUrl: string
): string {
  const dashboardUrl = `${websiteUrl}/my-leads`;
  
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .lead-details { margin: 20px 0; }
          .lead-detail { margin-bottom: 10px; }
          .label { font-weight: bold; }
          .price { color: #059669; font-weight: bold; font-size: 1.2em; }
          .success { color: #059669; font-weight: bold; }
          .cta-button { 
            display: inline-block; 
            background-color: #059669; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
          }
          .footer { margin-top: 20px; font-size: 0.8em; color: #6b7280; text-align: center; }
          .celebration { font-size: 2em; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations! Your Lead Was Sold!</h1>
          </div>
          <div class="content">
            <div class="celebration">💰✨</div>
            <p>Hello ${seller.full_name || 'Seller'},</p>
            <p class="success">Great news! Your lead has been successfully purchased and you've earned ${formattedPrice}!</p>
            
            <div class="lead-details">
              <h3>Sold Lead Details:</h3>
              <div class="lead-detail">
                <span class="label">Lead Type:</span> ${lead.type}
              </div>
              <div class="lead-detail">
                <span class="label">Location:</span> ${lead.location}
              </div>
              <div class="lead-detail">
                <span class="label">Sale Price:</span> <span class="price">${formattedPrice}</span>
              </div>
              <div class="lead-detail">
                <span class="label">Sold Date:</span> ${saleDate}
              </div>
            </div>
            
            <p>The lead has been successfully transferred to the buyer and your earnings have been processed.</p>
            
            <a href="${dashboardUrl}" class="cta-button">View Your Dashboard</a>
          </div>
          <div class="footer">
            <p>Keep uploading quality leads to maximize your earnings!</p>
            <p>Thank you for being part of our marketplace.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates email subject for lead sold notifications
 */
export function generateLeadSoldEmailSubject(lead: any, price: string): string {
  return `🎉 Your ${lead.type} lead in ${lead.location} was sold for ${price}!`;
}
