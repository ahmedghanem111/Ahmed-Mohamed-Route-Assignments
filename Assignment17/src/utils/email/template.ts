const generateHtml = (otp: number | string) => {
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.1);">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#2563eb;padding:30px;">
              <h1 style="color:#ffffff;margin:0;">
                Welcome to socailApp
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <h2 style="margin-top:0;color:#333;">
                Verify Your Email
              </h2>

              <p style="font-size:16px;color:#666;line-height:1.8;">
                Thank you for registering! Please use the OTP below to verify your email address.
              </p>

              <div style="text-align:center;padding:30px 0;">
                <div style="
                  display:inline-block;
                  background:#2563eb;
                  color:#ffffff;
                  padding:15px 40px;
                  border-radius:8px;
                  font-size:32px;
                  font-weight:bold;
                  letter-spacing:8px;">
                  ${otp}
                </div>
              </div>

              <p style="font-size:14px;color:#888;line-height:1.6;">
                This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone for security reasons.
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

              <p style="font-size:13px;color:#999;">
                If you didn't create an account, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#f8f8f8;padding:20px;color:#999;font-size:13px;">
              © 2026 Ghanem. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  return htmlTemplate;
};

export default generateHtml;