const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { uploadBuffer, deleteByPublicId } = require('./cloudinary');

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'avatars');

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const ensureDir = () => fs.mkdir(UPLOADS_DIR, { recursive: true });

const uploadAvatar = async (buffer, mimetype) => {
  if (useCloudinary) {
    const result = await uploadBuffer(buffer, 'crm/avatars');
    return { url: result.secure_url, publicId: result.public_id };
  }

  await ensureDir();
  const ext = MIME_EXT[mimetype] || 'bin';
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, name), buffer);
  return { url: `/uploads/avatars/${name}`, publicId: `local:${name}` };
};

const deleteAvatar = async (publicId) => {
  if (!publicId) return;

  if (publicId.startsWith('local:')) {
    const name = publicId.slice('local:'.length);
    if (!/^[\w.\-]+$/.test(name)) return;
    try { await fs.unlink(path.join(UPLOADS_DIR, name)); } catch (_) {}
    return;
  }

  if (useCloudinary) {
    try { await deleteByPublicId(publicId); } catch (_) {}
  }
};

module.exports = { uploadAvatar, deleteAvatar, useCloudinary };
