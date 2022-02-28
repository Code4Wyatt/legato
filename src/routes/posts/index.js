import Post from "../../database/models/Post"
import User from "../../database/models/User"

const postRouter = Router();

// Create Post

postRouter.post("/", async (req, res, next) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (error) {
        res.status(500).json(error)
    }
})

// Get Specific Post

postRouter.get("/:id", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
})

// Edit Post

postRouter.put("/:id", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("Post updated successfully!")
        } else {
            res.status(403).json("You can only update your own posts.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// Delete Post

postRouter.delete("/:id", async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json("Post successfully deleted!")
        } else {
            res.status(403).json("You can only delete your own posts.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// Like and Dislike Post

postRouter.put("/:id/like", async (req, res, next) => {
    try {
        const port = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            res.status(200).json("Post liked!")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).json("Post disliked!")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// Get Timeline Posts

postRouter.get("/timeline"), async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.body.userId)
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendPosts = await Promise.all(currentUser.followings.map((friendId) => {
            return Post.find({ userId: friendId })
        }))
        res.json(userPosts.concat(...friendPosts))
    } catch (error) {
        res.status(500).json(error)
    }
}

export default postRouter