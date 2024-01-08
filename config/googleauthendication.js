const user = require('../helpers/userhelper')
const { OAuth2Client } = require('google-auth-library');
const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

module.exports = {
  google: async (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      // access_type: 'online',
      scope: ['https://www.googleapis.com/auth/plus.me', 'profile', 'email'],
    });
    console.log("auth url     :" + authUrl);
    res.redirect(authUrl);
  },
  googlecallback: async (req, res) => {
    const code = req.query.code;

    console.log("code   :" + code);

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // console.log("tokens     :"+ tokens);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // console.log(payload);

    const datas = {
      login: "google",
      email: payload.email,
      username: payload.email,
      name: payload.given_name,
      image: payload.picture,
    }
    console.log(datas);
    const userexist = await user.findexistuser(datas.username)
    if (!userexist) {
      const result = await user.insert(datas)
    }
    req.session.user = datas
    req.session.loggedIn = true;
    
    res.redirect('/users/home')
  },
  // googlelogin: async (req, res) => {
  //   const authUrl = oAuth2Client.generateAuthUrl({
  //     access_type: 'offline',
  //     scope: ['https://www.googleapis.com/auth/plus.me', 'profile', 'email'],
  //   });
  //   console.log("auth url     :" + authUrl);
  //   res.redirect(authUrl);
   
  // },
}
  // googlelogincallback: async (req, res) => {
  //   const code = req.query.code;
  //   const { tokens } = await oAuth2Client.getToken(code);
  //   oAuth2Client.setCredentials(tokens);
  //   const ticket = await oAuth2Client.verifyIdToken({
  //     idToken: tokens.id_token,
  //     audience: process.env.CLIENT_ID,
  //   });
  //   const payload = ticket.getPayload();
  //   const datas = {
  //     login: "google",
  //     email: payload.email,
  //     username: payload.email,
  //     name: payload.given_name,
  //   }
  //   const userexist = await user.findexistuser(datas.email)
  //   if (!userexist) {
  //     req.session.user = datas
  //     req.session.loggedIn = true;
  //     res.redirect('/users/home')
  //   }
  //   else{
  //     res.render('users/login', { errorMessage: 'First Register Email ID then login' });
  //   }

  // }
