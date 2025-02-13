import hungarian from "../algo";
import { fetchAllUsers } from "./src/api/userApi";
import { listGroupTasksApi, listUserTasksApi } from "./src/api/taskApi";

import exp from "constants";

async function solver(selectedUsers, selectedTasks, selectedGroup) {
  // get the user object
  let users = [];
  for (let user of selectedUsers) {
    let temp = await fetchAllUsers();
    let allUsers = temp.data.users;
    for (let tempUser of allUsers) {
      if (tempUser.user_id == user) {
        users.push(structuredClone(tempUser));
      }
    }
  }
  console.log("selectedUsers", users);

  // get the tasks
  let tasks = [];
  let tempTasks = await listGroupTasksApi(selectedGroup.group_id);
  // console.log(tempTasks.data);
  for (let task of selectedTasks) {
    for (let potentialtask of tempTasks.data) {
      if (task == potentialtask.task_id) {
        tasks.push(structuredClone(potentialtask));
      }
    }
  }
  console.log("selectedTask", tasks);

  let groupWeight = selectedGroup.weight || "1,1,1,1";
  if (groupWeight.length == 0 || !groupWeight || groupWeight == null) {
    groupWeight = [1, 1, 1, 1];
  } else {
    groupWeight = groupWeight.split(",").map(Number);
  }

  let costMatrix = [];
  for (let user of users) {
    let userCost = [];
    for (let task of tasks) {
      let skillCost = Math.max(
        0,
        (task.taskSkillLevel - user.skillLevel) / task.taskSkillLevel
      );
      let expCost = expertiseCost(user, task);

      let priority = 1 - task.taskPriority / 5;
      let availabilit = await userAvailability(user, task);

      let cost =
        groupWeight[0] * skillCost +
        groupWeight[1] * expCost +
        groupWeight[2] * priority +
        groupWeight[3] * availabilit;
      userCost.push(cost);
    }
    costMatrix.push(userCost);
  }

  if (selectedUsers.length > selectedTasks.length) {
    // padd the things boi
    const diff = selectedUsers.length - selectedTasks.length;
    for (let i = 0; i < costMatrix.length; i++) {
      for (let j = 0; j < diff; j++) {
        // dont make this value too big
        costMatrix[i].push(500);
      }
    }
  }
  console.log("costMatrix");
  console.table(costMatrix);
  let result = hungarian(costMatrix);
  console.log(result);
  let limit = selectedTasks.length - 1;
  result = removeNumbersAboveLimit(result, limit);
  console.log(result);

  let returnTable = [];

  for (let usr of result) {
    for (let tsk of usr) {
      returnTable.push({
        task: tasks[tsk],
        user: users[usr],
      });
    }
  }
  console.log(returnTable);
  return returnTable;
}

function removeNumbersAboveLimit(arr, limit) {
  return arr.map((innerArr) => {
    return innerArr.filter((num) => num <= limit);
  });
}

async function userAvailability(user, task) {
  let result = 0;
  let currTime = new Date();
  let oldestTime = new Date();
  //   console.log(currTime);
  let temp = await listUserTasksApi(user.user_id);
  if (temp.success == false) {
    return result;
  }
  // console.log("this is temp");
  // console.log(temp.data.tasks);
  const otherTasks = temp.data.tasks;
  for (let otherTask of otherTasks) {
    let taskDate = new Date(otherTask.due_date);
    if (taskDate > oldestTime) {
      oldestTime = taskDate;
    }
  }
  const diffInMs = Math.min(0, currTime.getTime() - oldestTime.getTime());
  // Convert milliseconds to days
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // Use Math.ceil to round up to the nearest whole day
  // ideal free time = 5
  return Math.max(0, (5 - diffInDays) / diffInDays);
}

function expertiseCost(user, task) {
  let userExpertise = "";
  if (user.userExpertise) {
    userExpertise = user.userExpertise.split(",").map((item) => item.trim());
  }
  let taskExpertise = "";
  if (task.taskExpertise) {
    taskExpertise = task.taskExpertise.split(",").map((item) => item.trim());
  }

  const currentExpertiseSet = new Set(userExpertise);

  //Count the number of remaining expertise values
  let remainingCount = 0;
  for (const expertise of taskExpertise) {
    if (!currentExpertiseSet.has(expertise)) {
      remainingCount++;
    }
  }

  return remainingCount / taskExpertise.length;
}

export default solver;
