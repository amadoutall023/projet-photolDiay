import { Router } from 'express';
import { getPendingSellerRequests, approveSellerRequest, rejectSellerRequest, getSellers, suspendSeller, activateSeller, deleteSeller } from './users.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

// Routes admin pour gérer les demandes de vendeurs
router.get('/seller-requests', authenticateToken, getPendingSellerRequests);
router.put('/seller-requests/:id/approve', authenticateToken, approveSellerRequest);
router.put('/seller-requests/:id/reject', authenticateToken, rejectSellerRequest);

// Routes admin pour gérer les vendeurs
router.get('/sellers', authenticateToken, getSellers);
router.put('/sellers/:id/suspend', authenticateToken, suspendSeller);
router.put('/sellers/:id/activate', authenticateToken, activateSeller);
router.delete('/sellers/:id', authenticateToken, deleteSeller);

export default router;