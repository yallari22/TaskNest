"use server";

import nodemailer from 'nodemailer';

// Create a transporter
let transporter;

// Initialize the transporter
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if we have the required environment variables
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  // If any of the required variables are missing, log a warning and return null
  if (!host || !port || !user || !pass) {
    console.warn('Email service not configured. Missing environment variables.');
    return null;
  }

  // Create the transporter
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

// Send email function
export async function sendEmail({ to, subject, html }) {
  try {
    const emailTransporter = getTransporter();

    // If the transporter is not configured, log a warning and return
    if (!emailTransporter) {
      console.warn('Email not sent: Email service not configured');
      return null;
    }

    const from = process.env.EMAIL_FROM || `"TaskNest" <${process.env.EMAIL_USER}>`;

    const info = await emailTransporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it and return null
    // This way, if email sending fails, it doesn't break the application
    return null;
  }
}

// Generate HTML for issue notification
export async function generateIssueNotificationHtml({ title, content, issue, type }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #6366f1;
          color: white;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .issue-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .issue-details {
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #6366f1;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${title}</h2>
      </div>
      <div class="content">
        <p>${content}</p>

        ${issue ? `
        <div class="issue-details">
          <div class="issue-title">${issue.title}</div>
          <p><strong>Status:</strong> ${issue.status}</p>
          <p><strong>Priority:</strong> ${issue.priority}</p>
        </div>
        ` : ''}

        ${issue ? `
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/project/${issue.projectId}?issue=${issue.id}" class="button">View Issue</a>
        ` : ''}
      </div>
      <div class="footer">
        <p>This is an automated message from TaskNest. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}
