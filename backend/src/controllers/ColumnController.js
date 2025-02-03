import "dotenv/config";
import { TaskColumn } from "../models/association.js";
import { Op } from "sequelize";

const addColumn = async (req, res) => {
    const { group_id, column_name } = req.body;

    try {
        const newColumn = await TaskColumn.create({ group_id, column_name });
        return res.status(201).json({
            success: true,
            data: newColumn
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error adding column',
            error: error.message
        });
    }
};

const removeColumn = async (req, res) => {
    const { column_id } = req.body;

    try {
        const column = await TaskColumn.findByPk(column_id);
        if (!column) {
            return res.status(404).json({
                success: false,
                message: 'Column not found'
            });
        }

        await column.destroy();
        return res.status(200).json({
            success: true,
            message: 'Column removed successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error removing column',
            error: error.message
        });
    }
};

const getAllColumns = async (req, res) => {
    try {
        const { group_id } = req.body;
        const columns = await TaskColumn.findAll({
            where: {
                group_id: {
                    [Op.eq]: group_id
                }
            }
        });
        res.status(200).json(columns);
    } catch (error) {
        console.error('Error fetching columns:', error);
        res.status(500).json({ message: 'Error fetching columns' });
    }
};

export { addColumn, removeColumn, getAllColumns };