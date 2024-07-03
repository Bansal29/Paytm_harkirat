// const express = require("express");
// const router = express.Router();
// module.exports = router;
// const zod = require("zod");
// const { User } = require("../db");
// const jwt = require("jsonwebtoken");
// const { JWT_SECRET } = require("../config.js");
// const { authmiddleware } = require("../middleware.js");

// //defining signup route for the user
// const signupbody = zod.object({
//   username: zod.string().email(),
//   firstname: zod.string(),
//   lastname: zod.string(),
//   password: zod.string(),
// });

// router.post("/signup", async (req, res) => {
//   const { success } = signupbody.safeParse(req.body);
//   if (!success) {
//     return res.status(411).json({
//       message: "Invalid Credentials!",
//     });
//   }
//   const existingUser = await User.findOne({
//     username: req.body.username,
//   });
//   if (existingUser) {
//     return res.status(411).json({
//       message: "Email already taken/Incorrect inputs",
//     });
//   }
//   const user = await User.create({
//     username: req.bodu.username,
//     password: req.body.password,
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//   });
//   const user_id = user._id;
//   await Account.create({
//     userId,
//     balance: 1 + Math.random() * 10000,
//   });
//   const token = jwt.sign({ user_id }, JWT_SECRET);
//   res.json({
//     message: "user created successfully!",
//     token: token,
//   });
// });

// //Sign-in route
// const signinBody = zod.object({
//   username: zod.string().email(),
//   password: zod.string(),
// });
// router.post("/signin", async (req, res) => {
//   const { success } = signinBody.safeParse(req.body);
//   if (!success) {
//     return res.status(411).json({
//       message: "Invalid Credentials!",
//     });
//   }
//   const user = await User.findOne({
//     username: req.body.username,
//     password: req.body.password,
//   });
//   if (user) {
//     const user_id = user._id;
//     const token = jwt.sign({ user_id }, JWT_SECRET);
//     res.json({
//       token: token,
//     });
//     return;
//   }
//   res.status(411).json({
//     message: "Error while loggin in!!",
//   });
// });

// //update userinfo route
// const updatebody = zod.object({
//   password: zod.string().optional(),
//   firstName: zod.string().optional(),
//   lastName: zod.string().optional(),
// });
// router.put("/", authmiddleware, async (req, res) => {
//   const { success } = updatebody.safeParse(req.body);
//   if (!success) {
//     res.status(411).json({
//       message: "Error updating user information!!",
//     });
//   }
//   await User.updateOne(req.body, {
//     _id: req.user_id,
//   });
//   res.json({
//     message: "updated successfully!",
//   });
// });

// //get user based on search
// router.get("/bulk", async (req, res) => {
//   const filter = req.query.filter || "";
//   //to filter users based on particular firstname or lastname
//   //using regex in mongoDB
//   const users = await User.find({
//     $or: [
//       {
//         firstName: { $regex: filter },
//       },
//       {
//         lastName: { $regex: filter },
//       },
//     ],
//   });
//   res.json({
//     user: users.map((user) => ({
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       _id: user._id,
//     })),
//   });
// });
const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const { authmiddleware } = require("../middleware.js");

module.exports = router;

// Define signup route for the user
const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { success, error } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Invalid Credentials!",
      error: error.issues,
    });
  }
  const existingUser = await User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    return res.status(400).json({
      message: "Email already taken/Incorrect inputs",
    });
  }
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const user_id = user._id;
  await Account.create({
    userId: user_id,
    balance: 1 + Math.random() * 10000,
  });
  const token = jwt.sign({ user_id }, JWT_SECRET);
  res.json({
    message: "User created successfully!",
    token: token,
  });
});

// Sign-in route
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
router.post("/signin", async (req, res) => {
  const { success, error } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Invalid Credentials!",
      error: error.issues,
    });
  }
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (user) {
    const user_id = user._id;
    const token = jwt.sign({ user_id }, JWT_SECRET);
    res.json({
      token: token,
    });
    return;
  }
  res.status(400).json({
    message: "Error while logging in!!",
  });
});

// Update user info route
const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});
router.put("/", authmiddleware, async (req, res) => {
  const { success, error } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Error updating user information!!",
      error: error.issues,
    });
  }
  await User.updateOne({ _id: req.userId }, req.body);
  res.json({
    message: "Updated successfully!",
  });
});

// Get user based on search
router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";
  // To filter users based on particular firstName or lastName
  // Using regex in MongoDB
  const users = await User.find({
    $or: [
      { firstName: { $regex: filter, $options: "i" } },
      { lastName: { $regex: filter, $options: "i" } },
    ],
  });
  res.json({
    users: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
