import GroupMembers from "../models/GroupMembers.js";
import Groups from "../models/Groups.js";
import { Op } from "@sequelize/core";

class GroupMembersController {
  // Endpoint for a user to leave a group.
  // If after leaving, the remaining member count is less than or equal to 2, delete the group.
  leaveGroup = async (req, res) => {
    const { groupId } = req.body; // The group to leave
    const currentUserId = req.user.user_id;

    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, message: "Group ID is required." });
    }

    try {
      // Find the membership record for the current user.
      const membership = await GroupMembers.findOne({
        where: { group_id: groupId, user_id: currentUserId },
      });
      if (!membership) {
        return res
          .status(404)
          .json({ success: false, message: "Membership not found." });
      }

      // Remove the current user's membership.
      await membership.destroy();

      // Count the remaining members in the group.
      const remainingCount = await GroupMembers.count({
        where: { group_id: groupId },
      });

      // If the current user was admin OR if there are <= 2 members remaining, delete the group.
      if (membership.role === "admin" || remainingCount <= 2) {
        await Groups.destroy({ where: { group_id: groupId } });
        return res.json({
          success: true,
          message:
            "You have left the group. Since you were an admin or not enough members remain, the group has been deleted.",
        });
      }

      // Otherwise, simply return a success message.
      return res.json({ success: true, message: "You have left the group." });
    } catch (error) {
      console.error("Error leaving group:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  // Endpoint for an admin to remove a member from a group.
  // After removal, if the remaining member count is less than or equal to 2, delete the group.
  removeMember = async (req, res) => {
    const { groupId, memberId } = req.body; // groupId: target group; memberId: user to remove
    const currentUserId = req.user.user_id;

    if (!groupId || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Group ID and Member ID are required.",
      });
    }

    try {
      // Verify that the current user is an admin or moderator in the group.
      const adminMembership = await GroupMembers.findOne({
        where: {
          group_id: groupId,
          user_id: currentUserId,
          role: { [Op.or]: ["admin", "moderator"] },
        },
      });
      if (!adminMembership) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to remove members.",
        });
      }

      // Prevent admin from removing themselves.
      if (currentUserId === memberId) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot remove yourself. Use the leave group option instead.",
        });
      }

      // Find the membership record for the member to remove.
      const membership = await GroupMembers.findOne({
        where: { group_id: groupId, user_id: memberId },
      });
      if (!membership) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found in this group." });
      }

      // Remove the membership record.
      await membership.destroy();

      // Count the remaining members.
      const remainingCount = await GroupMembers.count({
        where: { group_id: groupId },
      });

      // If there are less than or equal to 2 members remaining, delete the group.
      if (remainingCount <= 2) {
        await Groups.destroy({ where: { group_id: groupId } });
        return res.json({
          success: true,
          message:
            "Member removed. The group has been deleted because there are not enough members remaining.",
        });
      }

      return res.json({
        success: true,
        message: "Member removed from the group.",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };
}

export default GroupMembersController;
