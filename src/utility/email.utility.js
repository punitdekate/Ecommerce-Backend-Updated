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
    html: `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  /* General Reset */
                  body, table, td, a {
                    margin: 0;
                    padding: 0;
                    text-size-adjust: 100%;
                    font-family: Arial, sans-serif;
                  }

                  /* Table structure */
                  table {
                    width: 100%;
                    max-width: 600px;
                    margin: auto;
                  }

                  /* Container */
                  .email-container {
                    background-color: #f4f4f4;
                    padding: 20px;
                  }

                  .email-body {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }

                  .email-header {
                    text-align: center;
                    padding-bottom: 20px;
                  }

                  .email-header h1 {
                    color: #333;
                  }

                  .email-content {
                    font-size: 16px;
                    color: #555;
                    line-height: 1.5;
                    padding: 20px 0;
                  }

                  .email-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                    padding-top: 20px;
                  }

                  @media only screen and (max-width: 600px) {
                    .email-body {
                      padding: 20px;
                    }
                    .email-header h1 {
                      font-size: 24px;
                    }
                    .email-content {
                      font-size: 14px;
                    }
                  }
                </style>
              </head>
              <body>

                <table>
                  <tr>
                    <td class="email-container">
                      <div class="email-body">
                        <div class="email-header">
                          <h1>Email Notification</h1>
                        </div>
                        <div class="email-content">
                          <p>Hello,</p>
                          <p>{${text}}</p>
                          <p>Best regards,<br> Ecommerce </p>
                        </div>
                        <div class="email-footer">
                          <p>This is an automated message. Please do not reply.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>

              </body>
              </html>`,
  };
  await transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Email sent :  ${info.response}`);
    }
  });
}
