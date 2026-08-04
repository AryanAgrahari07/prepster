const nodemailer = require('nodemailer');
const logger = require('../../config/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.FROM_NAME || 'Prepster'}" <${process.env.FROM_EMAIL || 'noreply@prepster.in'}>`;

const send = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject} (SMTP credentials missing)`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    logger.info(`[EMAIL SENT] To: ${to} | Subject: ${subject} | MessageId: ${info.messageId}`);
  } catch (err) {
    logger.error(`[EMAIL FAILED] To: ${to} | ${err.message}`);
    throw err;
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────
const sendOtpEmail = async (user, otp) => {
  const firstName = user.profile?.firstName || 'there';
  await send(
    user.email,
    'Verify your Prepster account',
    `<h2>Hi ${firstName}! 👋</h2>
     <p>Thanks for signing up. Your 6-digit verification code is:</p>
     <div style="background:#f3f4f6;color:#111827;padding:16px 24px;border-radius:8px;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;margin:24px 0;">
       ${otp}
     </div>
     <p>This code expires in 10 minutes.</p>
     <p>– Team Prepster</p>`
  );
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  const firstName = user.profile?.firstName || 'there';
  await send(
    user.email,
    'Reset your Prepster password',
    `<h2>Hi ${firstName},</h2>
     <p>We received a request to reset your password. Click below (expires in 1 hour):</p>
     <a href="${url}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a>
     <p>If you didn't request this, you can safely ignore this email.</p>
     <p>– Team Prepster</p>`
  );
};

const sendProActivationEmail = async (user, plan, expiresAt) => {
  const firstName = user.profile?.firstName || 'there';
  await send(
    user.email,
    '🎉 Welcome to Prepster Pro!',
    `<h2>You're now a Pro member, ${firstName}! 🚀</h2>
     <p>Your <strong>${plan}</strong> subscription is active until <strong>${new Date(expiresAt).toLocaleDateString('en-IN')}</strong>.</p>
     <p>Enjoy unlimited practice, all company tracks, and direct job applications.</p>
     <a href="${process.env.FRONTEND_URL}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Go to Dashboard</a>
     <p>– Team Prepster</p>`
  );
};

const sendPaymentFailedEmail = async (user) => {
  const firstName = user.profile?.firstName || 'there';
  await send(
    user.email,
    'Prepster — Payment Failed',
    `<h2>Hi ${firstName},</h2>
     <p>We were unable to process your payment. Your Pro access has a 3-day grace period.</p>
     <a href="${process.env.FRONTEND_URL}/upgrade" style="background:#ef4444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Update Payment</a>
     <p>– Team Prepster</p>`
  );
};

const sendApplicationStatusEmail = async (user, job, status) => {
  const firstName = user.profile?.firstName || 'there';
  const statusMessages = {
    shortlisted: { subject: '🎉 You\'ve been shortlisted!', body: 'Great news! You have been shortlisted' },
    'interview-scheduled': { subject: '📅 Interview Scheduled', body: 'Your interview has been scheduled' },
    'offer-extended': { subject: '🏆 Offer Extended!', body: 'Congratulations! You have received an offer' },
    rejected: { subject: 'Application Update', body: 'Thank you for applying. Unfortunately' },
  };
  const msg = statusMessages[status] || { subject: 'Application Update', body: 'Your application status has been updated' };
  await send(
    user.email,
    msg.subject,
    `<h2>Hi ${firstName},</h2>
     <p>${msg.body} for <strong>${job.title}</strong> at <strong>${job.companyName}</strong>.</p>
     <a href="${process.env.FRONTEND_URL}/applications" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">View Application</a>
     <p>– Team Prepster</p>`
  );
};

const sendJobAlertEmail = async (user, jobs) => {
  const firstName = user.profile?.firstName || 'there';
  const jobList = jobs.map(j => `<li><a href="${process.env.FRONTEND_URL}/jobs/${j._id}">${j.title} at ${j.companyName} — ${j.location}</a></li>`).join('');
  await send(
    user.email,
    `${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your profile!`,
    `<h2>Hi ${firstName}, new opportunities for you! 💼</h2>
     <ul>${jobList}</ul>
     <a href="${process.env.FRONTEND_URL}/jobs" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Browse All Jobs</a>
     <p>– Team Prepster</p>`
  );
};

const sendRenewalReminderEmail = async (user, daysLeft, expiresAt) => {
  const firstName = user.profile?.firstName || 'there';
  await send(
    user.email,
    `⏰ Your Prepster Pro expires in ${daysLeft} days`,
    `<h2>Hi ${firstName},</h2>
     <p>Your Pro subscription expires on <strong>${new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
     <p>Renew now to keep access to unlimited practice, all company tracks, and direct job applications.</p>
     <a href="${process.env.FRONTEND_URL}/upgrade" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Renew Pro</a>
     <p>– Team Prepster</p>`
  );
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendProActivationEmail,
  sendPaymentFailedEmail,
  sendApplicationStatusEmail,
  sendJobAlertEmail,
  sendRenewalReminderEmail,
};
