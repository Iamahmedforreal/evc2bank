import Transaction from '../models/transaction.js';
import Wallet from '../models/wallet.js';
import User from '../models/userModel.js';
import { v4 as uuidv4 } from 'uuid';

const transactionController = {};

// EVC → Bank Transfer
transactionController.evcToBankTransfer = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const wallet = await Wallet.findOne({ userid: userId });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (wallet.evcBalance < amount) {
            return res.status(400).json({ message: 'Insufficient EVC balance' });
        }

        const reference = `EVC2BANK-${uuidv4()}`;
        const balanceBefore = wallet.evcBalance;

        // Deduct from EVC balance and add to bank balance
        wallet.evcBalance -= amount;
        wallet.bankbalance += amount;
        const balanceAfter = wallet.evcBalance;

        await wallet.save();

        // Log transaction
        const transaction = new Transaction({
            userId,
            amount,
            type: 'evc_to_bank',
            status: 'completed',
            description: `Transfer from EVC to Bank: $${amount}`,
            reference,
            balanceBefore,
            balanceAfter
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Transfer completed successfully',
            transaction,
            newEvcBalance: wallet.evcBalance,
            newBankBalance: wallet.bankbalance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bank → EVC Transfer
transactionController.bankToEvcTransfer = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const wallet = await Wallet.findOne({ userid: userId });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (wallet.bankbalance < amount) {
            return res.status(400).json({ message: 'Insufficient bank balance' });
        }

        const reference = `BANK2EVC-${uuidv4()}`;
        const balanceBefore = wallet.evcBalance;

        // Deduct from bank balance and add to EVC balance
        wallet.bankbalance -= amount;
        wallet.evcBalance += amount;
        const balanceAfter = wallet.evcBalance;

        await wallet.save();

        // Log transaction
        const transaction = new Transaction({
            userId,
            amount,
            type: 'bank_to_evc',
            status: 'completed',
            description: `Transfer from Bank to EVC: $${amount}`,
            reference,
            balanceBefore,
            balanceAfter
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Transfer completed successfully',
            transaction,
            newEvcBalance: wallet.evcBalance,
            newBankBalance: wallet.bankbalance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Transaction History
transactionController.getTransactionHistory = async (req, res) => {
    try {
        let userId = req.params.userId;

        // If user is not admin and trying to access someone else's transactions
        if (req.user.role !== 'admin' && userId !== req.user.id && userId !== 'me') {
            return res.status(403).json({ message: 'Access denied: You can only view your own transactions' });
        }

        // Handle 'me' parameter
        if (userId === 'me') {
            userId = req.user.id;
        }

        // Admin can see all transactions if no userId specified
        if (req.user.role === 'admin' && !userId) {
            const transactions = await Transaction.find()
                .populate('userId', 'firstName lastName phone')
                .sort({ createdAt: -1 });
            return res.status(200).json(transactions);
        }

        const transactions = await Transaction.find({ userId })
            .populate('userId', 'firstName lastName phone')
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check Wallet Balance
transactionController.checkWalletBalance = async (req, res) => {
    try {
        let userId = req.params.userId;

        // If user is not admin and trying to access someone else's wallet
        if (req.user.role !== 'admin' && userId !== req.user.id && userId !== 'me') {
            return res.status(403).json({ message: 'Access denied: You can only check your own balance' });
        }

        // Handle 'me' parameter
        if (userId === 'me') {
            userId = req.user.id;
        }

        const wallet = await Wallet.findOne({ userid: userId })
            .populate('userid', 'firstName lastName phone');

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.status(200).json({
            userId: wallet.userid,
            evcBalance: wallet.evcBalance,
            bankBalance: wallet.bankbalance,
            currency: wallet.currancy,
            lastUpdated: wallet.updatedAt
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default transactionController;
