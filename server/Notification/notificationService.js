const nodemailer = require('nodemailer');
const twilio = require('twilio');

const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL_HOST_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_HOST_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let emailTransporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

let smsClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  smsClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

const getDisplayName = (user) => {
  if (!user) return 'Provider';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.company || user.username || 'Provider';
};

const formatDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const normalizePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
};

const buildStatusMessage = (appointment, eventType = 'CONFIRMED', previousAppointment = null) => {
  const appointmentDate = formatDate(appointment?.date);
  const appointmentTime = appointment?.time || 'Unknown time';
  const serviceName = appointment?.service?.name || 'Service';
  const providerName = getDisplayName(appointment?.client);
  const normalizedType = String(eventType || '').toUpperCase();

  if (normalizedType === 'CANCELLED') {
    return {
      subject: 'Your appointment was cancelled',
      text: `Your appointment on ${appointmentDate} at ${appointmentTime} has been cancelled. Service: ${serviceName}. Provider: ${providerName}.`,
      html: `
        <p>Your appointment has been cancelled.</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
      `
    };
  }

  if (normalizedType === 'COMPLETED') {
    return {
      subject: 'Your appointment is completed',
      text: `Your appointment on ${appointmentDate} at ${appointmentTime} is marked as completed. Service: ${serviceName}. Provider: ${providerName}.`,
      html: `
        <p>Your appointment is marked as completed.</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
      `
    };
  }

  if (normalizedType === 'RESCHEDULED') {
    const oldDate = formatDate(previousAppointment?.date);
    const oldTime = previousAppointment?.time || 'Unknown time';
    return {
      subject: 'Your appointment was rescheduled',
      text: `Your appointment was rescheduled from ${oldDate} at ${oldTime} to ${appointmentDate} at ${appointmentTime}. Service: ${serviceName}. Provider: ${providerName}.`,
      html: `
        <p>Your appointment has been rescheduled.</p>
        <p><strong>Previous:</strong> ${oldDate} at ${oldTime}</p>
        <p><strong>New:</strong> ${appointmentDate} at ${appointmentTime}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
      `
    };
  }

  return {
    subject: 'Your appointment is confirmed',
    text: `Your appointment is confirmed on ${appointmentDate} at ${appointmentTime}. Service: ${serviceName}. Provider: ${providerName}.`,
    html: `
      <p>Your appointment is confirmed.</p>
      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Provider:</strong> ${providerName}</p>
    `
  };
};

const sendAppointmentStatusNotifications = async (appointment, eventType = 'CONFIRMED', previousAppointment = null) => {
  if (!appointment || !appointment.user) return;

  const message = buildStatusMessage(appointment, eventType, previousAppointment);
  const tasks = [];

  if (emailTransporter && appointment.user.email) {
    tasks.push(
      emailTransporter.sendMail({
        from: EMAIL_FROM,
        to: appointment.user.email,
        subject: message.subject,
        text: message.text,
        html: message.html
      }).catch((error) => {
        console.error('Failed to send confirmation email:', error.message);
      })
    );
  }

  const recipientPhone = normalizePhoneNumber(appointment.user.mobile);
  if (smsClient && TWILIO_PHONE_NUMBER && recipientPhone) {
    tasks.push(
      smsClient.messages.create({
        body: message.text,
        from: TWILIO_PHONE_NUMBER,
        to: recipientPhone
      }).catch((error) => {
        console.error('Failed to send confirmation SMS:', error.message);
      })
    );
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }
};

const sendAppointmentConfirmedNotifications = async (appointment) => {
  await sendAppointmentStatusNotifications(appointment, 'CONFIRMED');
};

module.exports = {
  sendAppointmentConfirmedNotifications,
  sendAppointmentStatusNotifications
};
