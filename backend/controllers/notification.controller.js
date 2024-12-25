import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // gets all the notification which belong to user and populating the from path
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "-password",
    });

    //after getting all the notifications changing read path to true
    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // deleting all the notifications belonging to user
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Failed to delete notifications" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification Not found" });
    }
    console.log(userId.toString());
    console.log(notification.to.toString());

    if (userId.toString() === notification.to.toString()) {
      await Notification.findByIdAndDelete(id);
      res.status(200).json({ message: "Notification deleted successfully" });
    } else {
      res
        .status(200)
        .json({ message: "Notification Can't be deleted by anotherUSser" });
    }
  } catch (error) {}
};
