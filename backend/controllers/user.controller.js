import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  //gets username form thr paramater ie the url

  try {
    //searches from the username in the db and returns the data excluding the password
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not Found /:" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error in getUserprofile${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("In followUnfollowUser", id, req.user._id);

    //Checks if the current User and the userToModify are same
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can not follow yourself" });
    }
    const userToMOdify = await User.findById(id);
    const currentUser = req.user;

    // Check for User. if the currentUser or the userToModify exists or not
    if (!userToMOdify || !currentUser) {
      return res.status(400).json({ error: "User not found " });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed sucessfully" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: id,
      });

      await newNotification.save();

      res.status(200).json({ meessage: "User followed Sucessfully" });
    }
  } catch (error) {
    console.log(`Error in followUnfollowUser: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
