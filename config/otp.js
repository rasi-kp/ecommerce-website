const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

module.exports = {
    generateOTP: () => {
        return randomstring.generate({
            length: 6,
            charset: 'numeric',
        });
    },
    sendOTPEmail: async (email, otp) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: 'rasir239@gmail.com',
            to: email,
            subject: 'OTP for Sign-up',
            text: `Your OTP for sign-up is: ${otp}`,
        };
        await transporter.sendMail(mailOptions);
    }
}
// Step 1: Generate OTP
