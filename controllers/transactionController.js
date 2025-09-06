import Transaction from '../models/transaction.js';
import Wallet from '../models/wallet.js';
import User from '../models/userModel.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/enhancedLogger.js';

const transactionController = {};

// EVC → Bank Transfer
transactionController.evcToBankTransfer = async (req, res) => {
    const timer = logger.startTimer('EVC to Bank Transfer');
    
    try {
        const { amount } = req.body;
        const userId = req.user.id;
        
        logger.transaction('EVC to Bank transfer initiated', { userId, amount });

        if (!amount || amount <= 0) {
            logger.warn('Transfer failed: Invalid amount', { amount, userId }, 'TRANSACTION_VALIDATION');
            return res.status(400).json({ message: 'Invalid amount' });
        }

        logger.database('Finding user wallet', { userId });
        const wallet = await Wallet.findOne({ userid: userId });
        if (!wallet) {
            logger.warn('Transfer failed: Wallet not found', { userId }, 'TRANSACTION_WALLET_NOT_FOUND');
            return res.status(404).json({ message: 'Wallet not found' });
        }

        logger.transaction('Checking EVC balance', { 
            userId, 
            requestedAmount: amount, 
            availableBalance: wallet.evcBalance 
        });
        if (wallet.evcBalance < amount) {
            logger.warn('Transfer failed: Insufficient EVC balance', {
                userId,
                requestedAmount: amount,
                availableBalance: wallet.evcBalance
            }, 'TRANSACTION_INSUFFICIENT_FUNDS');
            return res.status(400).json({ message: 'Insufficient EVC balance' });
        }

        const reference = `EVC2BANK-${uuidv4()}`;
        const balanceBefore = wallet.evcBalance;
        
        logger.transaction('Processing transfer', { reference, balanceBefore, amount });

        // Deduct from EVC balance and add to bank balance
        wallet.evcBalance -= amount;
        wallet.bankbalance += amount;
        const balanceAfter = wallet.evcBalance;

        logger.database('Updating wallet balances...');
        await wallet.save();

        // Log transaction
        logger.database('Creating transaction record...');
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
        
        const duration = logger.endTimer(timer);
        logger.success('EVC to Bank transfer completed successfully', {
            userId,
            amount,
            reference,
            transactionId: transaction._id,
            transferTime: duration,
            newEvcBalance: wallet.evcBalance,
            newBankBalance: wallet.bankbalance
        }, 'TRANSACTION_SUCCESS');

        res.status(200).json({
            success: true,
            message: 'Transfer completed successfully',
            transaction,
            newEvcBalance: wallet.evcBalance,
            newBankBalance: wallet.bankbalance
        });

    } catch (error) {
        logger.endTimer(timer);
        logger.error('EVC to Bank transfer failed', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            requestBody: req.body
        }, 'TRANSACTION_ERROR');
        res.status(500).json({ message: error.message });
    }
};

// Bank → EVC Transfer
transactionController.bankToEvcTransfer = async (req, res) => {
    const timer = logger.startTimer('Bank to EVC Transfer');
    
    try {
        const { amount } = req.body;
        const userId = req.user.id;
        
        logger.transaction('Bank to EVC transfer initiated', { userId, amount });

        if (!amount || amount <= 0) {
            logger.warn('Transfer failed: Invalid amount', { amount, userId }, 'TRANSACTION_VALIDATION');
            return res.status(400).json({ message: 'Invalid amount' });
        }

        logger.database('Finding user wallet', { userId });
        const wallet = await Wallet.findOne({ userid: userId });
        if (!wallet) {
            logger.warn('Transfer failed: Wallet not found', { userId }, 'TRANSACTION_WALLET_NOT_FOUND');
            return res.status(404).json({ message: 'Wallet not found' });
        }

        logger.transaction('Checking bank balance', { 
            userId, 
            requestedAmount: amount, 
            availableBalance: wallet.bankbalance 
        });
        if (wallet.bankbalance < amount) {
            logger.warn('Transfer failed: Insufficient bank balance', {
                userId,
                requestedAmount: amount,
                availableBalance: wallet.bankbalance
            }, 'TRANSACTION_INSUFFICIENT_FUNDS');
            return res.status(400).json({ message: 'Insufficient bank balance' });
        }

        const reference = `BANK2EVC-${uuidv4()}`;
        const balanceBefore = wallet.evcBalance;
        
        logger.transaction('Processing transfer', { reference, balanceBefore, amount });

        // Deduct from bank balance and add to EVC balance
        wallet.bankbalance -= amount;
        wallet.evcBalance += amount;
        const balanceAfter = wallet.evcBalance;

        logger.database('Updating wallet balances...');
        await wallet.save();

        // Log transaction
        logger.database('Creating transaction record...');
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
        
        const duration = logger.endTimer(timer);
        logger.success('Bank to EVC transfer completed successfully', {
            userId,
            amount,
            reference,
            transactionId: transaction._id,
            transferTime: duration,
            newEvcBalance: wallet.evcBalance,
            newBankBalance: wallet.bankbalance
        }, 'TRANSACTION_SUCCESS');

        res.status(200).json({
            success: true,
            message: 'Transfer completed successfully',
            transaction,
            newEvcBalance: wallet.evcBalance,
            newBankBalance: wallet.bankbalance
        });

    } catch (error) {
        logger.endTimer(timer);
        logger.error('Bank to EVC transfer failed', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            requestBody: req.body
        }, 'TRANSACTION_ERROR');
        res.status(500).json({ message: error.message });
    }
};

// Get Transaction History
transactionController.getTransactionHistory = async (req, res) => {
    const timer = logger.startTimer('Get Transaction History');
    
    try {
        let userId = req.params.userId;
        
        logger.transaction('Fetching transaction history', { 
            requesterId: req.user.id, 
            requesterRole: req.user.role, 
            targetUserId: userId 
        });

        // If user is not admin and trying to access someone else's transactions
        if (req.user.role !== 'admin' && userId !== req.user.id && userId !== 'me') {
            logger.warn('Transaction history access denied', {
                requesterId: req.user.id,
                requesterRole: req.user.role,
                targetUserId: userId
            }, 'TRANSACTION_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: You can only view your own transactions' });
        }

        // Handle 'me' parameter
        if (userId === 'me') {
            userId = req.user.id;
            logger.transaction('Resolved "me" parameter to user ID', { userId });
        }

        // Admin can see all transactions if no userId specified
        if (req.user.role === 'admin' && !userId) {
            logger.transaction('Admin fetching all transactions...');
            const transactions = await Transaction.find()
                .populate('userId', 'firstName lastName phone')
                .sort({ createdAt: -1 });
                
            const duration = logger.endTimer(timer);
            logger.success('All transactions fetched successfully', {
                count: transactions.length,
                requesterId: req.user.id,
                fetchTime: duration
            }, 'TRANSACTION_SUCCESS');
            
            return res.status(200).json(transactions);
        }

        logger.database('Fetching user-specific transactions', { userId });
        const transactions = await Transaction.find({ userId })
            .populate('userId', 'firstName lastName phone')
            .sort({ createdAt: -1 });

        const duration = logger.endTimer(timer);
        logger.success('Transaction history fetched successfully', {
            userId,
            count: transactions.length,
            requesterId: req.user.id,
            fetchTime: duration
        }, 'TRANSACTION_SUCCESS');

        res.status(200).json(transactions);

    } catch (error) {
        logger.endTimer(timer);
        logger.error('Failed to fetch transaction history', {
            error: error.message,
            stack: error.stack,
            requesterId: req.user?.id,
            targetUserId: req.params.userId
        }, 'TRANSACTION_ERROR');
        res.status(500).json({ message: error.message });
    }
};

// Check Wallet Balance
transactionController.checkWalletBalance = async (req, res) => {
    const timer = logger.startTimer('Check Wallet Balance');
    
    try {
        let userId = req.params.userId;
        
        logger.transaction('Checking wallet balance', { 
            requesterId: req.user.id, 
            requesterRole: req.user.role, 
            targetUserId: userId 
        });

        // If user is not admin and trying to access someone else's wallet
        if (req.user.role !== 'admin' && userId !== req.user.id && userId !== 'me') {
            logger.warn('Balance check access denied', {
                requesterId: req.user.id,
                requesterRole: req.user.role,
                targetUserId: userId
            }, 'TRANSACTION_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: You can only check your own balance' });
        }

        // Handle 'me' parameter
        if (userId === 'me') {
            userId = req.user.id;
            logger.transaction('Resolved "me" parameter to user ID', { userId });
        }

        logger.database('Finding wallet for balance check', { userId });
        const wallet = await Wallet.findOne({ userid: userId })
            .populate('userid', 'firstName lastName phone');

        if (!wallet) {
            logger.warn('Balance check failed: Wallet not found', { userId }, 'TRANSACTION_WALLET_NOT_FOUND');
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const duration = logger.endTimer(timer);
        logger.success('Wallet balance checked successfully', {
            userId,
            evcBalance: wallet.evcBalance,
            bankBalance: wallet.bankbalance,
            requesterId: req.user.id,
            checkTime: duration
        }, 'TRANSACTION_SUCCESS');

        res.status(200).json({
            userId: wallet.userid,
            evcBalance: wallet.evcBalance,
            bankBalance: wallet.bankbalance,
            currency: wallet.currancy,
            lastUpdated: wallet.updatedAt
        });

    } catch (error) {
        logger.endTimer(timer);
        logger.error('Failed to check wallet balance', {
            error: error.message,
            stack: error.stack,
            requesterId: req.user?.id,
            targetUserId: req.params.userId
        }, 'TRANSACTION_ERROR');
        res.status(500).json({ message: error.message });
    }
};

export default transactionController;
