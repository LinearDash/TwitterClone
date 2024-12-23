import User from "../models/user.model.js";
import Post from "../models/post.model.js";
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
