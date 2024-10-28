import { compare } from "bcrypt";
import User from "../model/UserModel.js";
import JWT from "jsonwebtoken";

const maxAge = 36000;
// Corrected token creation function
const createToken = ({ email, userId }) => {
  return JWT.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email");
    }

    // Create new user
    const user = await User.create({ email, password });

    // Create JWT token
    const token = createToken({ email: user.email, userId: user.id });

    console.log(token);

    // Set the token in a secure HTTP-only cookie

    // Send token and user info in response
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        token: token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User with given email not found");
    }

    // Check the password
    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(400).send("Password is incorrect");
    }

    // Create JWT token after successful authentication
    const token = createToken({ email: user.email, userId: user.id });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color,
        image: user.image,
        token: token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const userdata = await User.findById(req.userId);
    if (!userdata) {
      return res.status(404).send("user with given id not found");
    }

    return res.status(200).json({
      id: userdata.id,
      email: userdata.email,
      profileSetup: userdata.profileSetup,
      firstName: userdata.firstName,
      lastName: userdata.lastName,
      color: userdata.color,
      image: userdata.image,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .send("firstName, lastName, and color are required");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      color: userData.color,
      image: userData.image,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const logout = (req, res) => {
  try {
    // Optional: Perform any server-side logout actions (e.g., token invalidation)

    // Send response indicating successful logout
    return res.status(200).send("Successfully logged out");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};
