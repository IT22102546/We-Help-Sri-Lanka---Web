import Donar from "../models/donar.model.js";
import { errorHandler } from "../utils/error.js";

export const addDonar = async (req, res, next) => {
  try {
    const {
      donationId,
      donorName,
      donorPhone,
      donorEmail,
      donationType,
      deliveryMethod,
      notes,
      location,
      district,
    } = req.body;

    if (req.body.deliveryMethod) {
      if (!req.body.deliveryMethod) {
        return next(errorHandler(400, " deliveryMethod can not beempty!"));
      }
    }

    const newDonar = new Donar({
      donationId,
      donorName,
      donorPhone,
      donorEmail,
      donationType,
      deliveryMethod,
      notes,
      location,
      district,
    });

    await newDonar.save();

    res.status(200).json(newDonar);
  } catch (error) {
    next(error);
  }
};

//Get Donars into   page
export const getDonar = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 4;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const Donars = await Donar.find({ productId: req.params.productId })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json(Donars);
  } catch (error) {
    console.error("Error fetching Donars:", error);
    next(error);
  }
};

/*
export const UpdateDonar = async (req, res, next) => {
  try {
    const Donar = await Donar.findById(req.params.DonarId);
    if (!Donar) {
      return next(errorHandler(404, "Donar not found"));
    }

    if (Donar.userrefId !== req.user.id) {
      return next(errorHandler(403, "you are not allow to edit Donars"));
    }

    const updatedDonar = await Donar.findByIdAndUpdate(
      req.params.DonarId,
      {
        $set: {
          content: req.body.content,
          rating: req.body.rating,
          Donarimage: req.body.Donarimage,
          reply: req.body.reply,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedDonar);
  } catch (error) {
    next(error);
  }
};

export const deleteDonar = async (req, res, next) => {
  try {
    const Donar = await Donar.findById(req.params.DonarId);
    if (!Donar) {
      return next(errorHandler(404, "Donar not found"));
    }
    if (Donar.userrefId !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, "Your are not allow to delete this Donar"));
    }
    await Donar.findByIdAndDelete(req.params.DonarId);
    res.status(200).json("Donar has been deleted");
  } catch (error) {
    next(error);
  }
};

//Get Donars into admin dashboard
export const getDonars = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const Donars = await Donar.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex);

    const totalDonars = await Donar.countDocuments();
    const Fivestar = await Donar.countDocuments({ rating: 5 });
    const Fourstar = await Donar.countDocuments({ rating: 4 });
    const Threestar = await Donar.countDocuments({ rating: 3 });
    const Twostar = await Donar.countDocuments({ rating: 2 });
    const Onestar = await Donar.countDocuments({ rating: 1 });
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthDonars = await Donar.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      Donars,
      totalDonars,
      lastMonthDonars,
      Fivestar,
      Fourstar,
      Threestar,
      Twostar,
      Onestar,
    });
  } catch (error) {
    next(error);
  }
};

export const adminReply = async (req, res, next) => {
  try {
    const Donar = await Donar.findById(req.params.DonarId);
    if (!Donar) {
      return next(errorHandler(404, "Donar not found"));
    }

    if (Donar.userId !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, "you are not allow to reply Donars"));
    }

    const replyDonar = await Donar.findByIdAndUpdate(
      req.params.DonarId,
      {
        $set: {
          reply: req.body.reply,
        },
      },
      { new: true }
    );
    res.status(200).json(replyDonar);
  } catch (error) {
    next(error);
  }
};
*/
