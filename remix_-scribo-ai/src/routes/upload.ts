import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: './public/assets',
  filename: (req, file, cb) => {
    cb(null, 'main-logo.png');
  }
});

const upload = multer({ storage });

router.post('/', upload.single('logo'), (req, res) => {
  res.json({ success: true, path: '/assets/main-logo.png' });
});

export default router;
