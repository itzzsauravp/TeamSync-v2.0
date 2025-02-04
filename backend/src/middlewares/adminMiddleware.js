import { Users, Groups } from "../models/association.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const group = await Groups.findByPk(req.params.groupId, {
      include: [
        {
          model: Users,
          as: "Members",
          where: { user_id: req.user.user_id },
          through: { where: { is_admin: true } },
        },
      ],
    });

    if (!group || group.Members.length === 0) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization check failed" });
  }
};

export default adminMiddleware;
