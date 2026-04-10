import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Các file type được phép upload
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Max size: 5MB (tính bằng bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/posts', // lưu vào thư mục này
    filename: (req, file, callback) => {
      // Tạo tên file unique: timestamp-uuid.ext
      const uniqueName = `${Date.now()}-${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),

  // Validate file type
  fileFilter: (req: any, file: any, callback: any) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        ),
        false,
      );
    }
    callback(null, true);
  },

  // Validate file size
  limits: {
    fileSize: MAX_FILE_SIZE, // 5MB
  },
};
