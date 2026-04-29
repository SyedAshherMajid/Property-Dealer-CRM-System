import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendNewLeadEmail(lead: {
  name: string;
  email: string;
  phone: string;
  budget: number;
  priority: string;
  source: string;
  propertyInterest: string;
}) {
  const budgetFormatted = `PKR ${lead.budget.toLocaleString()}`;
  const priorityColor = lead.priority === 'High' ? '#dc2626' : lead.priority === 'Medium' ? '#d97706' : '#16a34a';

  await transporter.sendMail({
    from: `"Property Dealer CRM" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🏠 New Lead Created: ${lead.name} — ${lead.priority} Priority`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 40px;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🏢 Property Dealer CRM</h1>
            <p style="color:#93c5fd;margin:8px 0 0;">New Lead Alert</p>
          </div>
          <div style="padding:40px;">
            <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
              <p style="margin:0;color:#1e40af;font-weight:600;font-size:16px;">A new lead has been added to the system</p>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:40%;">Client Name</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${lead.name}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${lead.email}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Phone</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${lead.phone}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Property Interest</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${lead.propertyInterest}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Budget</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${budgetFormatted}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Source</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${lead.source}</td></tr>
              <tr><td style="padding:12px 0;color:#64748b;">Priority</td><td style="padding:12px 0;"><span style="background:${priorityColor}22;color:${priorityColor};padding:4px 12px;border-radius:20px;font-weight:600;font-size:13px;">${lead.priority}</span></td></tr>
            </table>
            <div style="margin-top:32px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL}/admin" style="background:linear-gradient(135deg,#2563eb,#1e40af);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">View in CRM Dashboard →</a>
            </div>
          </div>
          <div style="padding:24px 40px;background:#f8fafc;text-align:center;color:#94a3b8;font-size:13px;">
            <p style="margin:0;">Property Dealer CRM System • Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendLeadAssignmentEmail(data: {
  agentName: string;
  agentEmail: string;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  propertyInterest: string;
  budget: number;
  priority: string;
}) {
  const budgetFormatted = `PKR ${data.budget.toLocaleString()}`;
  const priorityColor = data.priority === 'High' ? '#dc2626' : data.priority === 'Medium' ? '#d97706' : '#16a34a';

  await transporter.sendMail({
    from: `"Property Dealer CRM" <${process.env.EMAIL_USER}>`,
    to: data.agentEmail,
    subject: `📋 Lead Assigned to You: ${data.leadName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#064e3b,#059669);padding:32px 40px;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">🏢 Property Dealer CRM</h1>
            <p style="color:#a7f3d0;margin:8px 0 0;">Lead Assignment Notification</p>
          </div>
          <div style="padding:40px;">
            <p style="color:#0f172a;font-size:18px;margin:0 0 8px;">Hi <strong>${data.agentName}</strong>,</p>
            <p style="color:#64748b;margin:0 0 28px;">A new lead has been assigned to you. Please follow up as soon as possible.</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:40%;">Client Name</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${data.leadName}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Phone</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${data.leadPhone}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Email</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${data.leadEmail}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Property Interest</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;">${data.propertyInterest}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;">Budget</td><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a;">${budgetFormatted}</td></tr>
              <tr><td style="padding:12px 0;color:#64748b;">Priority</td><td style="padding:12px 0;"><span style="background:${priorityColor}22;color:${priorityColor};padding:4px 12px;border-radius:20px;font-weight:600;font-size:13px;">${data.priority}</span></td></tr>
            </table>
            <div style="margin-top:32px;text-align:center;">
              <a href="${process.env.NEXTAUTH_URL}/agent" style="background:linear-gradient(135deg,#059669,#064e3b);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">View My Leads →</a>
            </div>
          </div>
          <div style="padding:24px 40px;background:#f8fafc;text-align:center;color:#94a3b8;font-size:13px;">
            <p style="margin:0;">Property Dealer CRM System • Automated Notification</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
