const Queue = require("bull");
const nodemailer = require("nodemailer");

(
    async () => { 
        const emailQueue = new Queue("emails");
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "cottagebakerz@gmail.com",
            pass: "cvfivvenactqxiop",
          },
        });

        const emails = [
          {
            to: "abayomiogunnusi@gmail.com",
            subject: "Email 1",
            text: "This is the message for email 1.",
          },
          {
            to: "test2@yopmail.com",
            subject: "Email 2",
            text: "This is the message for email 2.",
          },
        ];

        emails.forEach((email) => {
          emailQueue.add(email, { batch: 100 });
        });

        emailQueue.process(async (job) => {
            const email = job.data;
            console.log(email);
          try {
            await transporter.sendMail(email);
          } catch (error) {
              console.log(error);
              
          }
        });

    }
)()