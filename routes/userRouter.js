import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { permissionMiddleware } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Customer sends money from EVC → Bank
router.post("/transfer/evc-to-bank", 
  protect, 
  permissionMiddleware("transfer:evc_to_bank"), 
  (req, res) => {
    res.json({ message: "EVC → Bank transfer successful" });
});

// Customer sends money from Bank → EVC
router.post("/transfer/bank-to-evc", 
  protect, 
  permissionMiddleware("transfer:bank_to_evc"), 
  (req, res) => {
    res.json({ message: "Bank → EVC transfer successful" });
});

// Bank system checks balance
router.get("/bank/balance", 
  protect, 
  permissionMiddleware("query:balance"), 
  (req, res) => {
    res.json({ balance: 1000 });
});

// Admin approves transfer
router.post("/admin/approve-transfer", 
  protect, 
  permissionMiddleware("approve:transfer"), 
  (req, res) => {
    res.json({ message: "Transfer approved" });
});

export default router;
