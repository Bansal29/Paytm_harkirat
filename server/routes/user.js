const express = require("express");
const router = express.Router();
module.exports = router;
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const { authmiddleware } = require("../middleware.js");

//defining signup route for the user
const signupbody = zod.object({
  username: zod.string().email(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupbody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid Credentials!",
    });
  }
  const existingUser = await User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken/Incorrect inputs",
    });
  }
  const user = await User.create({
    username: req.bodu.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const user_id = user._id;
  const token = jwt.sign({ user_id }, JWT_SECRET);
  res.json({
    message: "user created successfully!",
    token: token,
  });
});

//Sign-in route
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Invalid Credentials!",
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
  res.status(411).json({
    message: "Error while loggin in!!",
  });
});

//update userinfo route
const updatebody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});
router.put("/", authmiddleware, async (req, res) => {
  const { success } = updatebody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error updating user information!!",
    });
  }
  await User.updateOne(req.body, {
    _id: req.user_id,
  });
  res.json({
    message: "updated successfully!",
  });
});

//get user based on search
router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [
      {
        firstName: { $regex: filter },
      },
      {
        lastName: { $regex: filter },
      },
    ],
  });
  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
