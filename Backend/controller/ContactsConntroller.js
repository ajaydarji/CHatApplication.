import mongoose from "mongoose";
import User from "../model/UserModel.js";
import Message from "../model/MessagesModel.js";
// serchcontacts API
export const searchContacts = async (req, res) => {
  try {
    const { search } = req.body;

    // Check if search term exists
    if (!search) {
      return res.status(400).send("Search term is required");
    }

    // Sanitize the search term to escape special characters in regex
    const sanitizedSearchTerm = search.replace(/[.,~'"+=_-]/g, "\\$&");

    // Create a regex pattern for a case-insensitive search
    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Find contacts, excluding the current user
    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } }, // Exclude the current user
        {
          $or: [
            { firstName: regex }, // Match firstName with the regex
            { lastName: regex }, // Match lastName with the regex
            { email: regex }, // Match email with the regex
          ],
        },
      ],
    });

    // Return the list of contacts
    return res.status(200).json({ contacts });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

// getContactsForDMList API
export const getContactsForDMList = async (req, res) => {
  try {
    let userId = req.userID;

    // Ensure userId is valid and convert it to an ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }
    userId = new mongoose.Types.ObjectId(userId);

    // Find messages that involve the user (either as sender or recipient)
    const contacts = await Message.aggregate([
      // Match messages where the user is either the sender or recipient
      { $match: { $or: [{ sender: userId }, { recipient: userId }] } },

      // Sort by timestamp (most recent first)
      { $sort: { timeStamp: -1 } },

      // Group by the contact (either sender or recipient, depending on the user)
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient", // If the user is the sender, group by recipient
              else: "$sender", // Otherwise, group by sender
            },
          },
          lastMessageTime: { $first: "$timeStamp" }, // Keep track of the most recent message time
        },
      },

      // Lookup user details from the users collection
      {
        $lookup: {
          from: "users", // Name of the collection to lookup from (users collection)
          localField: "_id", // Field from the aggregation to match (the contact _id)
          foreignField: "_id", // Field from the users collection to match against
          as: "contactInfo", // Name of the output field for the joined data
        },
      },

      // Unwind the contactInfo array (since lookup results in an array)
      { $unwind: "$contactInfo" },

      // Project the desired fields
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email", // Fetch email from the joined user document
          firstName: "$contactInfo.firstName", // Fetch firstName from the joined user document
          lastName: "$contactInfo.lastName", // Fetch lastName from the joined user document
          color: "$contactInfo.color", // Fetch color (or any other custom field) from the user
        },
      },

      // Sort the final output by lastMessageTime (most recent first)
      { $sort: { lastMessageTime: -1 } },
    ]);

    // Return the list of contacts
    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getAllContacts = async (request, response, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: request.userId } },
      "firstName lastName _id"
    );

    const contacts = users.map((user) => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user._id,
    }));

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error.");
  }
};
