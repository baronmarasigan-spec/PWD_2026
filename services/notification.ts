
/**
 * Notification Service (Local-only Version)
 * All external API dependencies (OneWaySMS & Mailjet) have been removed.
 */

/**
 * Simulates sending an SMS.
 */
export const sendSMS = async (to: string, message: string) => {
  console.log(`[LOCAL-SMS] To: ${to} | Message: ${message}`);
  return true;
};

/**
 * Simulates sending an Email.
 */
export const sendEmail = async (to: string, subject: string, htmlBody: string, toName: string = 'User') => {
  console.log(`[LOCAL-EMAIL] To: ${toName} (${to}) | Subject: ${subject}`);
  return true;
};

/**
 * Generates and simulates sending a 6-digit OTP for mobile verification.
 */
export const sendOTP = async (to: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[LOCAL-OTP] Generated for ${to}: ${otp}`);
  // In local mode, we return the OTP immediately so the UI can proceed
  return otp;
};

/**
 * Triggers a simulated notification for successful registration.
 */
export const notifyRegistrationSuccess = async (name: string, phone: string, email: string) => {
  console.log(`[LOCAL-NOTIF] Registration received for ${name}. Logging notification intent.`);
  
  const emailSubject = "Complete Registration!";
  const emailLog = `Dear ${name}, your application for the PWDConnect Management System of San Juan City has been received and is pending approval.`;
  
  await sendEmail(email, emailSubject, emailLog, name);
  return Promise.allSettled([Promise.resolve(true)]);
};

/**
 * Orchestrates simulated notifications for application status updates.
 */
export const notifyStatusUpdate = async (userName: string, contact: string, email: string, type: string, status: string, reason?: string) => {
  const statusMsg = status === 'Approved' ? 'APPROVED' : 'DISAPPROVED';
  const reasonMsg = reason ? ` Reason: ${reason}` : '';
  const content = `Hello ${userName}, your ${type} application was ${statusMsg}.${reasonMsg}`;
  
  await sendSMS(contact, content);
  
  if (email) {
    await sendEmail(email, `PWDConnect: ${type} Update`, content, userName);
  }
};
