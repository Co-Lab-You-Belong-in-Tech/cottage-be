const welcomeTemplate = async (URL, firstName, emailToken) => {
  const html = `<!DOCTYPE html>
      <html
        lang="en"
        xmlns="http://www.w3.org/1999/xhtml"
        xmlns:o="urn:schemas-microsoft-com:office:office"
      >
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="x-apple-disable-message-reformatting" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
          <style>
            body {
              font-family: "Open Sans", sans-serif;
            }
            p,
            a {
              font-size: 15px;
            }
            main {
              padding: 0 2rem;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0">
          <div
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <img
              src="https://res.cloudinary.com/drsimple/image/upload/v1648719208/Spaceet_Logo_1_-1_scngz6.p"
              alt=""
              style="display: block; width: 120px; margin: auto; padding: 2rem"
            />
          </div>
          <main>
            <h1 style="text-align: center; font-size: 25px">Confirm Email</h1>
            <p>Hi ${firstName},</p>
            <p>
              We are excited to have you here. First, you need to confirm your
              account. Click on the button below.
            </p>
            <a
              href="${URL}/user/verifyemail/${emailToken}"
              style="
                display: block;
                text-align: center;
                width: 200px;
                margin: auto;
                background: #eab221;
                color: #ffffff;
                padding: 1rem;
                text-decoration: none;
              "
              >Confirm Account</a
            >
            <p>Link expires in 24 hours time.</p>
      
            <p>
              Verifying your email ensures that you can receive critical notifications
              and important updates at all times.
              <br />
              If this link has expired, log in to your account to resend your
              verification link. Please contact support with questions about email
              verification. Responses to this email are not monitored.
            </p>
            <p>
              Cheers, <br />
              The Cottage Team
            </p>
          </main>
          <footer>
            <p style="color: #12082d; text-align: center; padding: 2rem">
              Need help or have a question? <br />We are
              <a
                href="mailto:support@spaceet.com"
                style="color: #eab221; font-size: 18px"
                target="_blank"
                rel="noreferrer"
                >here</a
              >, ready to talk.
            </p>
            <p style="text-align: center">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                style="color: #eab221; text-decoration: none; padding: 10px"
              >
                <img
                  src=""
                  alt="Instagram"
                  style="width: 24px; height: 24px; filter: brigtness(0)"
                />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                style="color: #eab221; text-decoration: none; padding: 10px"
              >
                <img
                  src=""
                  alt="Twitter"
                  style="width: 24px; height: 24px"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/"
                target="_blank"
                rel="noreferrer"
                style="color: #eab221; text-decoration: none; padding: 10px"
              >
                <img
                  src=""
                  alt="LinkedIn"
                  style="width: 24px; height: 24px"
                />
              </a>
            </p>
          </footer>
        </body>
      </html>
                        `;
  return html;
};

module.exports = welcomeTemplate;
