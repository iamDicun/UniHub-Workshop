import pool from '../config/db.js';

export const insertWorkshopImage = async (image) => {
  const { rows } = await pool.query(
    `INSERT INTO workshop_images (workshop_id, object_key, cdn_url, cdn_thumb, cdn_medium, cdn_large, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      image.workshop_id,
      image.object_key,
      image.cdn_url,
      image.cdn_thumb,
      image.cdn_medium,
      image.cdn_large,
      image.sort_order ?? 0,
    ],
  );
  return rows[0];
};

export const getImagesByWorkshopId = async (workshopId) => {
  const { rows } = await pool.query(
    `SELECT id, workshop_id, object_key, cdn_url, cdn_thumb, cdn_medium, cdn_large, sort_order, created_at
     FROM workshop_images
     WHERE workshop_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [workshopId],
  );
  return rows;
};

export const getImageById = async (imageId) => {
  const { rows } = await pool.query(
    'SELECT * FROM workshop_images WHERE id = $1',
    [imageId],
  );
  return rows[0] || null;
};

export const deleteWorkshopImage = async (imageId) => {
  const { rows } = await pool.query(
    'DELETE FROM workshop_images WHERE id = $1 RETURNING *',
    [imageId],
  );
  return rows[0] || null;
};

export const countImagesByWorkshopId = async (workshopId) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM workshop_images WHERE workshop_id = $1',
    [workshopId],
  );
  return rows[0].count;
};
