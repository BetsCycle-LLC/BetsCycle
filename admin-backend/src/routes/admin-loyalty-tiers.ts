import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

import {
  listLoyaltyTiers,
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier,
} from '../controllers/adminLoyaltyTiersController';
import { requireAuth } from '../middleware/auth';

export const adminLoyaltyTiersRouter = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/loyalty-icons');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `tier-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

adminLoyaltyTiersRouter.get('/', requireAuth, listLoyaltyTiers);
adminLoyaltyTiersRouter.post('/', requireAuth, upload.single('icon'), createLoyaltyTier);
adminLoyaltyTiersRouter.put('/:tierId', requireAuth, upload.single('icon'), updateLoyaltyTier);
adminLoyaltyTiersRouter.delete('/:tierId', requireAuth, deleteLoyaltyTier);

