import Wallet from '../models/wallet.js';
import User from '../models/userModel.js';

const walletController = {};

walletController.getWallet = async (req, res) => {
    try {
        const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;

        if (req.params.userId === 'me' && req.user.id !== userId) {
            return res.status(403).json({ message: 'Access denied: You can only view your own wallet' });
        }

        const wallet = await Wallet.findOne({ userid: userId });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }
        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

walletController.updateWallet = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can update wallets' });
        }

        const walletId = req.params.id;
        const { evcBalance, bankBalance, currancy } = req.body;

        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        wallet.evcBalance = evcBalance !== undefined ? evcBalance : wallet.evcBalance;
        wallet.bankBalance = bankBalance !== undefined ? bankBalance : wallet.bankBalance;
        wallet.currancy = currancy || wallet.currancy;

        await wallet.save();
        res.status(200).json({ message: 'Wallet updated successfully', wallet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

walletController.createWallet = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can create wallets' });
        }

        const { userId, evcBalance, bankBalance, currancy } = req.body;

        let wallet = await Wallet.findOne({ userid: userId });
        if (wallet) {
            return res.status(400).json({ message: 'Wallet already exists for this user' });
        }

        wallet = new Wallet({
            userid: userId,
            evcBalance,
            bankBalance,
            currancy
        });

        await wallet.save();
        res.status(201).json({ message: 'Wallet created successfully', wallet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

walletController.deleteWallet = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can delete wallets' });
        }

        const walletId = req.params.id;
        const wallet = await Wallet.findById(walletId);

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        await Wallet.deleteOne({ _id: walletId });
        res.status(200).json({ message: 'Wallet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default walletController;
