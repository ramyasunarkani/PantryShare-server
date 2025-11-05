const Sib = require("sib-api-v3-sdk");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sendEmail = async (toEmail, subject, htmlContent, textContent) => {
  try {
    const sender = {
      email: "ramyakrishnasunarkani@gmail.com", 
      name: "Pantry Share",                   
    };

    const receivers = [{ email: toEmail }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      htmlContent,
      textContent,
    });

    console.log("Email sent successfully to:", toEmail);
  } catch (err) {
    console.error("Error sending email:", err.message);
  }
};

module.exports = sendEmail;
