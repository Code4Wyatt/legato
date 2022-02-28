

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