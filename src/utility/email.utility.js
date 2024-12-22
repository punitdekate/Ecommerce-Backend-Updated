import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendNotification(email, subject, text, data = null) {
  // send mail with defined transport object
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.GMAIL_NOTIFICATION_USERNAME,
      pass: process.env.GMAIL_NOTIFICATION_SECRET,
    },
  });

  const options = {
    from: process.env.GMAIL_NOTIFICATION_USERNAME,
    to: `${email}`,
    subject: `${subject}`,
    text: `${text}`,
    // html: "<b>Hello world?</b>", // html body
  };
  await transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent :  ${info.response}`);
    }
  });
}
