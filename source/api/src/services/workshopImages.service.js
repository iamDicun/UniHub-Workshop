import {
  insertWorkshopImage,
  getImagesByWorkshopId,
  getImageById,
  deleteWorkshopImage,
  countImagesByWorkshopId,
} from '../repositories/workshopImages.repository.js';

const MAX_IMAGES_PER_WORKSHOP = 5;

export const addWorkshopImage = async (workshopId, userId, payload) => {
  // Validate input
  if (!payload.object_key || !payload.cdn_url || !payload.cdn_thumb || !payload.cdn_medium || !payload.cdn_large) {
    throw Object.assign(new Error('Missing required CDN URL fields.'), { statusCode: 400 });
  }

  // Check limit
  const currentCount = await countImagesByWorkshopId(workshopId);
  if (currentCount >= MAX_IMAGES_PER_WORKSHOP) {
    throw Object.assign(
      new Error(`Tối đa ${MAX_IMAGES_PER_WORKSHOP} ảnh cho mỗi workshop.`),
      { statusCode: 400 }
    );
  }

  const nextOrder = currentCount;

  const image = await insertWorkshopImage({
    workshop_id: workshopId,
    object_key: payload.object_key,
    cdn_url: payload.cdn_url,
    cdn_thumb: payload.cdn_thumb,
    cdn_medium: payload.cdn_medium,
    cdn_large: payload.cdn_large,
    sort_order: nextOrder,
  });

  return image;
};

export const listWorkshopImages = async (workshopId) => {
  return getImagesByWorkshopId(workshopId);
};

export const removeWorkshopImage = async (workshopId, imageId) => {
  const image = await getImageById(imageId);
  if (!image) {
    throw Object.assign(new Error('Image not found.'), { statusCode: 404 });
  }
  if (image.workshop_id !== workshopId) {
    throw Object.assign(new Error('Image does not belong to this workshop.'), { statusCode: 400 });
  }
  return deleteWorkshopImage(imageId);
};
