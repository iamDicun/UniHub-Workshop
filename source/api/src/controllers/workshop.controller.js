import {
  listWorkshops,
  getWorkshopDetail,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopRegistrations,
} from '../services/workshop.service.js';
import { aiGenerateWorkshop } from '../services/workshopAI.service.js';
import {
  addWorkshopImage,
  listWorkshopImages,
  removeWorkshopImage,
} from '../services/workshopImages.service.js';

export const getWorkshops = async (req, res, next) => {
  try {
    const workshops = await listWorkshops(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { workshops },
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkshopById = async (req, res, next) => {
  try {
    const workshop = await getWorkshopDetail(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: workshop,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const createWorkshopHandler = async (req, res, next) => {
  try {
    const workshop = await createWorkshop(req.body, req.user.id);
    res.status(201).json({
      status: 'success',
      data: workshop,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateWorkshopHandler = async (req, res, next) => {
  try {
    const workshop = await updateWorkshop(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: workshop,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteWorkshopHandler = async (req, res, next) => {
  try {
    const deleted = await deleteWorkshop(req.params.id);
    res.status(200).json({
      status: 'success',
      data: deleted,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getWorkshopRegistrationsHandler = async (req, res, next) => {
  try {
    const data = await getWorkshopRegistrations(req.params.id);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const aiGenerateWorkshopHandler = async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ message: 'fileId is required.' });
    }
    const data = await aiGenerateWorkshop(fileId, req.user.id);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getWorkshopImagesHandler = async (req, res, next) => {
  try {
    const images = await listWorkshopImages(req.params.id);
    res.status(200).json({ status: 'success', data: images });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const addWorkshopImageHandler = async (req, res, next) => {
  try {
    const image = await addWorkshopImage(req.params.id, req.user.id, req.body);
    res.status(201).json({ status: 'success', data: image });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteWorkshopImageHandler = async (req, res, next) => {
  try {
    await removeWorkshopImage(req.params.id, req.params.imageId);
    res.status(200).json({ status: 'success', message: 'Image deleted.' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
