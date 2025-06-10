
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
  websiteUrl: string
): string {
  // Get the website URL from environment or use a fallback
  const marketplaceUrl = `${websiteUrl}/marketplace`;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Alert</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #374151;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
          }
          
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="90" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
          }
          
          .header h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
            z-index: 1;
          }
          
          .content { 
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #111827;
            margin-bottom: 16px;
          }
          
          .intro-text {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .lead-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
          }
          
          .lead-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            border-radius: 12px 12px 0 0;
          }
          
          .lead-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .lead-type {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            text-transform: capitalize;
          }
          
          .price-tag {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 700;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .lead-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .detail-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .detail-value {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }
          
          .description {
            grid-column: 1 / -1;
            margin-top: 8px;
          }
          
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }
          
          .cta-text {
            font-size: 16px;
            color: #374151;
            margin-bottom: 24px;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 20px -3px rgba(79, 70, 229, 0.4);
          }
          
          .urgency-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
          }
          
          .urgency-note .icon {
            font-size: 20px;
            margin-bottom: 8px;
          }
          
          .urgency-text {
            color: #92400e;
            font-weight: 500;
            font-size: 14px;
          }
          
          .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
          }
          
          .footer-link {
            color: #4f46e5;
            text-decoration: none;
          }
          
          @media (max-width: 480px) {
            .email-container {
              margin: 0 10px;
              border-radius: 8px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .lead-card {
              padding: 20px;
            }
            
            .lead-header {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .lead-details {
              grid-template-columns: 1fr;
            }
            
            .cta-button {
              padding: 14px 28px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🚨 New Lead Alert</h1>
            <p class="subtitle">A fresh opportunity just landed in your area</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello there!</div>
            <p class="intro-text">
              A new high-quality lead has just been uploaded to the marketplace and is now available for purchase. 
              Don't miss this opportunity to grow your business!
            </p>
            
            <div class="lead-card">
              <div class="lead-header">
                <div class="lead-type">${lead.type}</div>
                <div class="price-tag">${formattedPrice}</div>
              </div>
              
              <div class="lead-details">
                <div class="detail-item">
                  <div class="detail-label">📍 Location</div>
                  <div class="detail-value">${lead.location}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">📅 Date Added</div>
                  <div class="detail-value">${creationDate}</div>
                </div>
                <div class="detail-item description">
                  <div class="detail-label">📝 Description</div>
                  <div class="detail-value">${lead.description || 'No additional details provided'}</div>
                </div>
              </div>
            </div>
            
            <div class="urgency-note">
              <div class="icon">⚡</div>
              <div class="urgency-text">
                <strong>Act Fast!</strong> High-quality leads like this are typically purchased within hours.
              </div>
            </div>
            
            <div class="cta-section">
              <p class="cta-text">Ready to secure this lead?</p>
              <a href="${marketplaceUrl}" class="cta-button">View Lead in Marketplace</a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              You're receiving this email because you've enabled lead notifications in your profile. 
              <br>
              You can <a href="${websiteUrl}/profile" class="footer-link">manage your notification preferences</a> anytime.
            </p>
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

