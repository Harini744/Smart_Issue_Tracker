const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email service not configured, skipping email to:', to);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Smart Issue Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

exports.sendStatusUpdateEmail = async (user, complaint) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #6366f1; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">Complaint Status Update</h2>
      </div>
      <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your complaint has been updated:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Title:</td><td>${complaint.title}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Status:</td>
            <td><span style="background: #6366f1; color: white; padding: 2px 8px; border-radius: 4px;">${complaint.status}</span></td>
          </tr>
          <tr><td style="padding: 8px; font-weight: bold;">Priority:</td><td>${complaint.priority}</td></tr>
        </table>
        <p style="margin-top: 20px;">Login to your portal to view full details.</p>
      </div>
      <div style="padding: 10px; text-align: center; color: #6b7280; font-size: 12px;">
        Smart Issue Tracking System
      </div>
    </div>
  `;
  await sendEmail({ to: user.email, subject: `Complaint Update: ${complaint.title}`, html });
};

exports.sendNewComplaintEmail = async (adminEmail, complaint, student) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #ef4444; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">New Complaint Submitted</h2>
      </div>
      <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
        <p>A new complaint has been submitted:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold;">Student:</td><td>${student.name} (${student.email})</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Title:</td><td>${complaint.title}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Category:</td><td>${complaint.category}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Priority:</td><td>${complaint.priority}</td></tr>
        </table>
      </div>
    </div>
  `;
  await sendEmail({ to: adminEmail, subject: `New Complaint: ${complaint.title}`, html });
};
