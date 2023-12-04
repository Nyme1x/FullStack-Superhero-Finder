const express = require('express');
const router = express.Router();

// Mongodb user model
const User = require('./../models/user');
// Mongodb user verification model
const UserVerification = require('../models/UserVerification');
// Password handler
const bcrypt = require('bcrypt');
// Path for static verified page
const path = require('path');
// Email handler
const nodemailer = require('nodemailer');
// Unique string
const { v4: uuidv4 } = require('uuid');
// Environment variables
require('dotenv').config();


//nodemailer stuff
let transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})


//testing sucess
transporter.verify((error,success)=> {
    if(error) {
        console.log(error);

    } else {
        console.log("Ready for messages");
        console.log(success);
    }
})

router.post('/signUp', (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (name == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty Input Fields"
        });
    } else if (!/^[a-zA-Z ]*$/.test(name)) { // Allowing space for full names
        res.json({
            status: "FAILED",
            message: "Invalid Entry Please Try Again (name)"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid Entry Please Try Again (email)"
        });
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password not long enough"
        });
    } else {
        // Check if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                // A user already exists
                res.json({
                    status: "FAILED",
                    message: "User with the given email already exists"
                });
            } else {
                // Try to create new user

                // password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    
                    const newUser = new User({
                        name,
                        email,
                        password : hashedPassword,
                        Verified: false,
                
                    })
                    
                    newUser.save().then(result => {
                        //handle account verification
                        sendVerificationEmail(result, res);
                    })
                    .catch (err => {
                        res.json ({
                            status : "FAILED",
                            message : "Error occured while saving user account"
                        })

                    })
                    
                })  
                .catch(err => {
                    res.json ({
                        status : "FAILED",
                        message : "Error occured while hashing password!"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            });
        });
    }
});


//send verification email
const sendVerificationEmail = ({_id, email}, res) => {
    //url to be used in email 
    const currentURL = "http://localhost:3000/";

    const uniqueString = uuidv4() + _id;
    
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete signup and log into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href="${currentURL + "users/verify/" +_id+ "/"  + uniqueString}>here</a> to proceed.</p>`,

    };

    //hash the uniqueString 
    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
        // set values in userVerification collection
        const newVerificaiton = new UserVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000,
        });

        newVerificaiton
        .save()
        .then(() => {
            transporter
            .sendMail(mailOptions)
            .then(()=> {
                //email send and verified
                res.json ({
                    status: "PENDING",
                    message: "Verification Email Sent"
                });

            })
            .catch((error) => {
                console.log(error);
                res.json({
                    status: "FAILED",
                    message: "Verification Email Failed!"
                })
            })
        })
        .catch((error) => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Couldn't save verificaiton email data!",
            });

        })
        
    })
    .catch(()=>{
        res.json({
            status: "FAILED",
            message: "An error occured while hashing email data!",
        })
    })

}

//verify email
router.get('/verify/:userId/:uniqueString', (req,res) => {
    let{userId, uniqueString} = req.params;

    UserVerification
    .find({userId})
    .then(result => {
        if(result.length > 0){
            //user verification record exists so we proceed
            

            const {expiresAt} = result[0];
            const hashedUniqueString = result[0].uniqueString;
            //checking for expired unique string
            if(expiresAt< Date.now()){
                // record has expired so we delete it
                UserVerification
                    .deleteOne({userId})
                    .then(result => {
                        User
                            .deleteOne({_id: userId})
                            .then(() => {
                                let message = "Link has expired. Please sign up again";
                                res.redirect( `/users/verified/error=true&message=${message}`)

                            })
                            .catch(error => {
                                let message = "Clearing user with expired unique string failed";
                                res.redirect( `/users/verified/error=true&message=${message}`)

                            })
                    })
                    .catch((error) => {
                        console.log(error)
                        let message = "An error occured while clearing expired user verification record";
                        res.redirect( `/users/verified/error=true&message=${message}`)
                    })
            } else {
                //valid record exists so we validate the user string 
                //First compare the hashed unique string

                bcrypt
                .compare(uniqueString, hashedUniqueString)
                .then(result => {
                    if(result){
                        //string match

                        User
                        .updateOne({_id: userId}, {Verified: true})
                        .then(()=> {
                            UserVerification.deleteOne({userId})
                            .then(() =>{
                                res.sendFile(path.join(__dirname, '../verified.html'))
                            })
                            .catch(error =>{
                                let message = "An error occured while finalizing successful verificaiton.";
                            res.redirect( `/users/verified/error=true&message=${message}`)

                            })
                        })
                        .catch(error => {
                            console.log(error);
                            let message = "An error occured while updating user record to show verified.";
                            res.redirect( `/users/verified/error=true&message=${message}`)
                        })

                    } else {
                        // existing record but incorrect verification details passed
                        let message = "Invalid verification details passed check your inbox";
                        res.redirect( `/users/verified/error=true&message=${message}`)

                     }
                    
                })
                .catch(error => {
                    let message = "An error occured while comparing unique strings";
                    res.redirect( `/users/verified/error=true&message=${message}`)



                })
            }
        } else {
            //user verification record doesn't exist
            let message = "Account record doesn't exist or has been verified already. Please sign up or login.";
            res.redirect( `/users/verified/error=true&message=${message}`)
            

        }
    })
    .catch((error) =>{
       console.log(error);
       let message = "An error occured while checking for existing user verification record";
       res.redirect( `/users/verified/error=true&message=${message}`)
        })
});

//Verified page route
router.get("/verified",(req,res) =>{
    res.sendFile(path.join(__dirname, '../views/verified.html'))


})

router.put('/updatePassword', (req, res) => {
    let { email, oldPassword, newPassword } = req.body;
    if (email == "" || oldPassword == "" || newPassword == "") {
        return res.json({
            status: "FAILED",
            message: "Empty fields!"
        });
    }

    if (newPassword.length < 8) {
        return res.json({
            status: "FAILED",
            message: "Password is too short!"
        });
    }

    // Check if the user exists
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.json({
                    status: "FAILED",
                    message: "User does not exist!"
                });
            }

            // Check if oldPassword matches the one in the database
            bcrypt.compare(oldPassword, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        // Hash new password
                        bcrypt.hash(newPassword, 10)
                            .then(hashedPassword => {
                                // Update password in the database
                                User.updateOne({ email }, { $set: { password: hashedPassword } })
                                    .then(() => {
                                        res.json({
                                            status: "SUCCESS",
                                            message: "Password updated successfully!"
                                        });
                                    })
                                    .catch(err => {
                                        res.json({
                                            status: "FAILED",
                                            message: "An error occurred while updating the password!"
                                        });
                                    });
                            })
                            .catch(err => {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occurred while hashing the new password!"
                                });
                            });
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Old password is incorrect!"
                        });
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while comparing passwords!"
                    });
                });
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while finding the user!"
            });
        });
});


const adminCheck = async (req, res, next) => {
    // Retrieve the admin's username from the request query
    const adminUsername = req.query.adminUsername; 
  
    try {
      const adminUser = await User.findOne({ name: adminUsername });
      if (adminUser && adminUser.isAdmin) {
        next(); // The user is an admin, proceed to the next handler
      } else {
        return res.status(403).json({
          status: "FAILED",
          message: "Access denied. Admins only."
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: "FAILED",
        message: "Internal server error"
      });
    }
  };
  










router.post('/signIn', (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email === "" || password === "") {
        res.json({
            status: "FAIL",
            message: "Empty Input Fields"
        });
    } else {
        User.findOne({ email }).then(user => {
            if (user) {
                if (!user.Verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox."
                    });
                } else {
                    bcrypt.compare(password, user.password).then(isMatch => {
                        if (isMatch) {
                            // Include isAdmin in the response
                            res.json({
                                status: "SUCCESS",
                                message: "Signin Successful",
                                isAdmin: user.isAdmin,
                                isDeactivated : user.isDeactivated
                            });
                        } else {
                            res.json({
                                status: "FAILED",
                                message: "Invalid Password Entered"
                            });
                        }
                    });
                }
            } else {
                res.json({
                    status: "FAILED",
                    message: "User not found"
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
            });
        });
    }
});

router.get('/users', async (req, res) => {
    try {
        // Fetch users who are not admins from the database
        const users = await User.find({ isAdmin: false }, 'name _id email isAdmin isDeactivated' ); // Select only non-admin users

        // Map the result to get an array of objects with name and ID
        const userList = users.map(user => {
            return { name: user.name, id: user._id, email: user.email, isAdmin: user.isAdmin, isDeactivated: user.isDeactivated};
        });

        // Send the response
        res.json({
            status: "SUCCESS",
            message: "Non-admin user list retrieved successfully",
            data: userList
        });
    } catch (error) {
        console.error('Error fetching non-admin users:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to toggle a user's active status based on the username (accessible by admins only)
router.put('/deactivate-user/:username', adminCheck, async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user by username
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({
                status: "FAILED",
                message: "User not found."
            });
        }

        // Check if the user is not an admin
        if (user.isAdmin) {
            return res.status(403).json({
                status: "FAILED",
                message: "Cannot change the active status of an admin user."
            });
        }

        // Toggle the isDeactivated field
        const updatedStatus = !user.isDeactivated;
        await User.updateOne({ _id: user._id }, { $set: { isDeactivated: updatedStatus } });

        res.status(200).json({
            status: "SUCCESS",
            message: `User has been successfully ${updatedStatus ? 'deactivated' : 'reactivated'}.`
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });
    }
});


// Route to grant admin privileges to a user based on the username
router.put('/grant-admin/:username', adminCheck, async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({name: username});
        if (!user) {
            return res.status(404).json({
                status: "FAILED",
                message: "User not found."
            });
        }

        // Set isAdmin to true and update the user
        await User.updateOne({ _id: user._id }, { $set: { isAdmin: true } });

        res.status(200).json({
            status: "SUCCESS",
            message: "User granted admin privileges."
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            status: "FAILED",
            message: "Server error"
        });
    }
});


module.exports = router;
