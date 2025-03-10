import User from "../models/user.model.js";

export const getUsersForSidebar= async(req,res) =>{
    try {
        const loggedInUserId =req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers)

        


    } catch (error) {
        console.error("error in getUsersForSidebar", error.message);
        res.status(500).json({error:"Internal server Error"});
        
    }

}
export const getMessages = async (req,res) => {
    try {
        const {id:userToChatId}=req.params
        const senderId=req.user._id;
    } catch (error) {
        
    }
}