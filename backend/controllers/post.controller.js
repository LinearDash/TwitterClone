import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have Text or Image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: req.user._id,
      text: text,
      img: img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Checks if the user is authorized to delete the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // If there is an image in the post, it will be deleted from Cloudinary
    if (post.img) {
      // Splitting the Cloudinary link to get only the image ID
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { text } = req.body;
    const userId = req.user._id;

    // Check if the post exists
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if the input exists
    if (!text) {
      return res.status(400).json({ message: "Comment can't be empty" });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    res.status(200).json({ message: "Comment added" });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike the Post
      post.likes.pull(userId);
      await user.likedPost.pull(req.params.id);

      await post.save();
      await user.save();

      // const updatedLikes = post.likes.filter(
      //   (id) => id.toString() !== userId.toString()
      // );
      const updatedLikes = post.likes;

      return res.status(200).json(updatedLikes);
    } else {
      // Like the post
      post.likes.push(userId);
      await user.likedPost.addToSet(req.params.id);

      //creating a new notification
      const newNotification = new Notification({
        type: "like",
        from: req.user._id,
        to: post.user,
      });

      await newNotification.save();
      await post.save();
      await user.save();

      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) return res.status(200).json([]);

    res.status(200).json(posts);
  } catch (error) {}
};

export const getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // console.log(user);
    if (!user) return res.status(404).json({ error: "User Not Found" });

    // gets all the likedpost from the user poulating Users
    const likedPosts = await Post.find({
      _id: { $in: user.likedPost },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        // for comments
        path: "comments.user",
        select: "-password",
      });

    // returns Liked posts
    res.status(200).json(likedPosts);
  } catch (error) {}
};

export const getFollowingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User Not Found" });

    // List of following users
    const following = user.following;

    // Get all the posts from the following users
    const followingPosts = await Post.find({ user: { $in: following } })
      .sort({
        // Sorting from latest to oldest by creation date
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(followingPosts);
  } catch (error) {
    console.error("Error fetching following posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User Not Found" });

    const posts = await Post.find({ user: user._id })
      .sort({
        //sorting out latest to oldest by creat date
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
