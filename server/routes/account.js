const express = require("express");
const { authmiddleware } = require("../middleware");
const { Account } = require("../db");
const router = express.Router();

//get balance route
router.get("/balance", authmiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });
  res.json({
    balance: account.balance,
  });
});

//conventional method for tranfer money endpoint
router.post("/transfer", authmiddleware, async (req, res) => {
  const { amount, toaccount } = req.body;
  const account = await Account.findOne({
    userId: req.userId,
  });
  if (account.balance < amount) {
    return res.status(400).json({ message: "Insufficient Balance" });
  }
  const toAccount = await Account.findOne({
    userId: toaccount,
  });
  if (!toAccount) {
    return res.status(400).json({ message: "Account not found" });
  }
  await Account.updateOne(
    {
      userId: req.userId,
    },
    {
      $inc: {
        balance: -amount,
      },
    }
  );
  await Account.updateOne(
    {
      userId: toaccount,
    },
    {
      $inc: {
        balance: amount,
      },
    }
  );
  res.json({
    message: "Transfer successful",
  });
});
module.exports = router;
