import { Request, Response } from 'express';
import { getSellerRequests, updateSellerRequest, updateUserRole } from './users.model';
import prisma from '../../../prisma/client';

export const getPendingSellerRequests = async (req: Request, res: Response) => {
  try {
    const requests = await getSellerRequests('pending');
    res.json({ requests });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
};

export const approveSellerRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = parseInt((req as any).user.id);

    // Mettre à jour la demande
    const updatedRequest = await updateSellerRequest(parseInt(id), {
      status: 'approved',
      reviewedBy: adminId
    });

    // Mettre à jour le rôle et le statut de l'utilisateur
    await updateUserRole(updatedRequest.userId, 'seller');
    // Note: updateUserRole met à jour le rôle, mais on doit aussi mettre à jour le statut
    await prisma.user.update({
      where: { id: updatedRequest.userId },
      data: { status: 'active' as any }
    });

    res.json({
      message: 'Demande approuvée avec succès',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de la demande' });
  }
};

export const rejectSellerRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = parseInt((req as any).user.id);

    // Mettre à jour la demande
    const updatedRequest = await updateSellerRequest(parseInt(id), {
      status: 'rejected',
      reason: reason || 'Demande rejetée par l\'administrateur',
      reviewedBy: adminId
    });

    res.json({
      message: 'Demande rejetée',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Erreur lors du rejet:', error);
    res.status(500).json({ error: 'Erreur lors du rejet de la demande' });
  }
};

export const getSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await prisma.user.findMany({
      where: {
        role: 'seller',
        OR: [
          { status: 'active' },
          { status: 'suspended' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ads: true
          }
        }
      }
    });

    res.json({ sellers });
  } catch (error) {
    console.error('Erreur lors de la récupération des vendeurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vendeurs' });
  }
};

export const suspendSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = parseInt((req as any).user.id);

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'suspended' as any }
    });

    res.json({ message: 'Vendeur suspendu avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suspension:', error);
    res.status(500).json({ error: 'Erreur lors de la suspension du vendeur' });
  }
};

export const activateSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = parseInt((req as any).user.id);

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'active' as any }
    });

    res.json({ message: 'Vendeur réactivé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réactivation:', error);
    res.status(500).json({ error: 'Erreur lors de la réactivation du vendeur' });
  }
};

export const deleteSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = parseInt((req as any).user.id);

    // Vérifier que le vendeur existe
    const seller = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Supprimer le vendeur (cette action supprimera aussi ses annonces via les contraintes de clé étrangère)
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Vendeur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du vendeur' });
  }
};