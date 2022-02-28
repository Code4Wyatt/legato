import bcrypt from "bcrypt";
import User from "../../database/models/User"

const authRouter = Router()

// Register 

authRouter.post("/register", async (req, res, next) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = new User({
            email: req.body.email,
            password: hashedPassword
        })

        const user = await newUser.save()
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }    
})

// Login

authRouter.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("User not found.");

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json("Wrong password!")

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
});

export default authRouter