const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.WEBSITE_EMAIL,
    pass: process.env.WEBSITE_EMAIL_PASS,
  },
});

const sendMail = (name, email, phone, message, callback) => {
  const mailOptions = {
    from: email,
    to: 'dylan.dewitt@mccoydewitt.com',
    subject: `${name} contacted you from your website`,
    html: `
    <div style="textalign:center;">
    <p>${message}</p>
    <p>email: ${email}</p>
    <p>phone: ${phone}</p>
    </div>`
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  })
}

module.exports = sendMail;

