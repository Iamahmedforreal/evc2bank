import Wallet from '../models/wallet.js';
import User from '../models/userModel.js';
import logger from '../utils/enhancedLogger.js';

const walletController = {};

walletController.getWallet = async (req, res) => {
    const timer = logger.startTimer('Get Wallet');
    
    try {
        const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;
        
        logger.wallet('Fetching wallet', { userId, requesterId: req.user.id });

        if (req.params.userId === 'me' && req.user.id !== userId) {
            logger.warn('Wallet access denied: Unauthorized access attempt', {
                requesterId: req.user.id,
                targetUserId: userId
            }, 'WALLET_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: You can only view your own wallet' });
        }

        logger.database('Finding wallet by user ID', { userId });
        const wallet = await Wallet.findOne({ userid: userId });
        if (!wallet) {
            logger.warn('Wallet not found', { userId }, 'WALLET_NOT_FOUND');
            return res.status(404).json({ message: 'Wallet not found' });
        }
        
        const duration = logger.endTimer(timer);
        logger.success('Wallet fetched successfully', {
            userId,
            walletId: wallet._id,
            fetchTime: duration
        }, 'WALLET_SUCCESS');
        
        res.status(200).json(wallet);
    } catch (error) {
        logger.endTimer(timer);
        logger.error('Failed to fetch wallet', {
            error: error.message,
            stack: error.stack,
            userId: req.params.userId
        }, 'WALLET_ERROR');
        res.status(500).json({ message: error.message });
    }
};

walletController.updateWallet = async (req, res) => {
    const timer = logger.startTimer('Update Wallet');
    const walletId = req.params.id;
    
    try {
        logger.wallet('Updating wallet', { walletId, requesterId: req.user.id });
        
        if (req.user.role !== 'admin') {
            logger.warn('Wallet update denied: Insufficient permissions', {
                requesterId: req.user.id,
                requesterRole: req.user.role,
                walletId
            }, 'WALLET_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: Only admins can update wallets' });
        }

        const { evcBalance, bankBalance, currancy } = req.body;
        logger.wallet('Wallet update parameters', { evcBalance, bankBalance, currancy });

        logger.database('Finding wallet to update', { walletId });
        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            logger.warn('Wallet update failed: Wallet not found', { walletId }, 'WALLET_NOT_FOUND');
            return res.status(404).json({ message: 'Wallet not found' });
        }

        logger.wallet('Applying wallet updates...');
        wallet.evcBalance = evcBalance !== undefined ? evcBalance : wallet.evcBalance;
        wallet.bankBalance = bankBalance !== undefined ? bankBalance : wallet.bankBalance;
        wallet.currancy = currancy || wallet.currancy;

        logger.database('Saving updated wallet...');
        await wallet.save();
        
        const duration = logger.endTimer(timer);
        logger.success('Wallet updated successfully', {
            walletId,
            updatedBy: req.user.id,
            updateTime: duration
        }, 'WALLET_SUCCESS');
        
        res.status(200).json({ message: 'Wallet updated successfully', wallet });
    } catch (error) {
        logger.endTimer(timer);
        logger.error('Wallet update failed', {
            error: error.message,
            stack: error.stack,
            walletId,
            requestBody: req.body
        }, 'WALLET_ERROR');
        res.status(500).json({ message: error.message });
    }
};

walletController.createWallet = async (req, res) => {
    const timer = logger.startTimer('Create Wallet');
    
    try {
        logger.wallet('Creating new wallet', { requesterId: req.user.id });
        
        if (req.user.role !== 'admin') {
            logger.warn('Wallet creation denied: Insufficient permissions', {
                requesterId: req.user.id,
                requesterRole: req.user.role
            }, 'WALLET_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: Only admins can create wallets' });
        }

        const { userId, evcBalance, bankBalance, currancy } = req.body;
        logger.wallet('Wallet creation parameters', { userId, evcBalance, bankBalance, currancy });

        logger.database('Checking for existing wallet', { userId });
        let wallet = await Wallet.findOne({ userid: userId });
        if (wallet) {
            logger.warn('Wallet creation failed: Wallet already exists', { userId }, 'WALLET_DUPLICATE');
            return res.status(400).json({ message: 'Wallet already exists for this user' });
        }

        logger.database('Creating new wallet in database...');
        wallet = new Wallet({
            userid: userId,
            evcBalance,
            bankBalance,
            currancy
        });

        await wallet.save();
        
        const duration = logger.endTimer(timer);
        logger.success('Wallet created successfully', {
            walletId: wallet._id,
            userId,
            createdBy: req.user.id,
            creationTime: duration
        }, 'WALLET_SUCCESS');
        
        res.status(201).json({ message: 'Wallet created successfully', wallet });
    } catch (error) {
        logger.endTimer(timer);
        logger.error('Wallet creation failed', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        }, 'WALLET_ERROR');
        res.status(500).json({ message: error.message });
    }
};

walletController.deleteWallet = async (req, res) => {
    const timer = logger.startTimer('Delete Wallet');
    const walletId = req.params.id;
    
    try {
        logger.wallet('Deleting wallet', { walletId, requesterId: req.user.id });
        
        if (req.user.role !== 'admin') {
            logger.warn('Wallet deletion denied: Insufficient permissions', {
                requesterId: req.user.id,
                requesterRole: req.user.role,
                walletId
            }, 'WALLET_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: Only admins can delete wallets' });
        }

        logger.database('Finding wallet to delete', { walletId });
        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            logger.warn('Wallet deletion failed: Wallet not found', { walletId }, 'WALLET_NOT_FOUND');
            return res.status(404).json({ message: 'Wallet not found' });
        }

        logger.database('Deleting wallet from database...', { walletId });
        await Wallet.deleteOne({ _id: walletId });
        
        const duration = logger.endTimer(timer);
        logger.success('Wallet deleted successfully', {
            walletId,
            deletedBy: req.user.id,
            deletionTime: duration
        }, 'WALLET_SUCCESS');
        
        res.status(200).json({ message: 'Wallet deleted successfully' });
    } catch (error) {
        logger.endTimer(timer);
        logger.error('Wallet deletion failed', {
            error: error.message,
            stack: error.stack,
            walletId
        }, 'WALLET_ERROR');
        res.status(500).json({ message: error.message });
    }
};

export default walletController;
