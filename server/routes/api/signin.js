const User = require('../../models/User');
const UserSession = require('../../models/UserSession');

module.exports = (app) => {
    //   app.get('/api/counters', (req, res, next) => {
    //     Counter.find()
    //       .exec()
    //       .then((counter) => res.json(counter))
    //       .catch((err) => next(err));
    //   });

    //   app.post('/api/counters', function (req, res, next) {
    //     const counter = new Counter();

    //     counter.save()
    //       .then(() => res.json(counter))
    //       .catch((err) => next(err));
    //   });
    /*
    * Sign Up
    */ 
    app.post('/api/account/signup', (req, res, next) => {
      const { body } = req;
      console.log();
      const {
          firstName,
          lastName,
          password
      } = body;
      let {
          email
      } = body;

      if (!firstName) {
         return res.end({
              success: false,
              message: 'Error: First name cannot be blank.'
          });
      }
      if (!lastName) {
         return res.end({
            success: false,
            message: 'Error: Last name cannot be blank.'
        });
    }      if (!email) {
         return res.end({
            success: false,
            message: 'Error: Email cannot be blank.'
        });
    }      if (!password) {
         return res.end({
            success: false,
            message: 'Error: Password cannot be blank.'
        });
    }
    console.log('here');

    email = email.toLowerCase();

    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    User.find({
        email: email
      },  (err, previousUsers) => {
        if (err) {
         return res.end({
             sucess:false,
             message: 'Error: Server error'
            });
        } else if (previousUsers.length > 0) {
         return res.send({
             success: false,
             message: 'Error: Acount already exists.'
            });
        }

        // Save the new user
        const newUser = new User();

        newUser.email = email;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.password = newUser.generateHash(password);
        newUser.save((err,user) => {
         if (err) {
             return res.send({
                 success: false,
                 message: 'Error: Server Error'
             });
         }
         return res.send({
             success: true,
             message: 'Signed up'
        });
      });
    });

   });

   app.post('/api/account/signin', (req, res, next) => {
    const { body } = req;
    const {
        firstName,
        lastName,
        password
    } = body;
    let {
        email
    } = body;


    if (!email) {
        return res.end({
           success: false,
           message: 'Error: Email cannot be blank.'
       });
   }      if (!password) {
        return res.end({
           success: false,
           message: 'Error: Password cannot be blank.'
       });
   }

    email = email.toLowerCase();

    User.find({
      email: email
     }, (err, users) => {
     if (err) {
      console.log('err 2:', err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
     }
     if (users.length != 1) {
      return res.send({
        success: false,
        message: 'Error: Invalid'
      });
    }

    const user = users[0];
    if (!user.validPassword(password)) {
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    }

    // Otherwise correct user
    const userSession = new UserSession();
    userSession.userId = user._id;
    userSession.save((err, doc) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: server error'
        });
      }
      return res.send({
          success: true,
          message: 'Valid sign in',
          token: doc._id
      });
    })
    });
  });
  app.get('/api/account/verify', (req, res, next) => {
    // Get the token
    const { query } = req;
    const { token } = query;
    // Token=test

    // Verify the token is one of a kind and its not deleted

    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {
      if (err) {
        console.log(err);
        return res.send ({
          success: false,
          message: 'Error: Server error',
       });
      }

      if (sessions.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid'
        });
      } else {
        return res.send({
          success: true,
          message: 'Good'
        });
      }
    });
  });
  app.get('/api/account/logout', (req, res, next) => {
    // Get the token
    const { query } = req;
    const { token } = query;
    // Token=test

    // Verify the token is one of a kind and its not deleted

    UserSession.findOneAndUpdate({
      _id: token,
      isDeleted: false
     }, {
      $set: {
          isDeleted:true
        }
     }, null, (err, sessions) => {
      if (err) {
        return res.send ({
          success: false,
          message: 'Error: Server error',
       });
      }
        return res.send({
          success: false,
          message: 'Good'
        });
      });
    });
  };