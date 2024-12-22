import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

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

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    //list of user being followed by me
    const followingUsers = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    //filters out users from my following list
    const filteredUsers = users.filter(
      (user) => !followingUsers.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(`Error in getSuggestedUsers: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { fullname, username, email, currentPassword, newPassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    //If user not found
    if (!user) return res.status(404).json({ message: "User Not Found" });

    //Check for any empty input for passowrd change
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({ message: "Provide Both current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Current Password invalid " });
      }
      if (newPassword < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profileImg) {
      if (user.profileImg) {
        //this splits the url to get the imageid
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uplodedResponse = await cloudinary.uploader.upload(profilrImg);
      profileImg = uplodedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        //this splits the url to get the imageid
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uplodedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uplodedResponse.secure_url;
    }
    user.fullName = fullname || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    await user.save();

    user.password = null;

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log(`Error in updateUser: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
