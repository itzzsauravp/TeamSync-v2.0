import hungarian from "../algo";
import { fetchAllUsers } from "./src/api/userApi";
import { listGroupTasksApi, listUserTasksApi } from "./src/api/taskApi";
import { updateUserAttributes } from "./src/api/userApi";
import { fetchAllGroups } from "./src/api/groupApi";

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

  let foo = await fetchAllGroups();
  foo = foo.groups.find((g) => g.group_id == selectedGroup.group_id).weight;
  // console.log("foo", foo);
  let groupWeight = foo || "1,1,1,1";
  if (groupWeight.length == 0 || !groupWeight || groupWeight == null) {
    groupWeight = [1, 1, 1, 1];
  } else {
    groupWeight = groupWeight.split(",").map(Number);
  }
  console.log("using groupWeight", groupWeight);

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

      // let cost =
      let one = groupWeight[0] * skillCost;
      let two = groupWeight[1] * expCost;
      let three = groupWeight[2] * priority;
      let four = groupWeight[3] * availabilit;
      if(one == 0) one = 0.1;
      if(two == 0) two = 0.1;
      if(three == 0) three = 0.1;
      if(four == 0) four = 0.1;
      let cost = one + two + three + four;

      if (cost == Infinity || cost == undefined) cost = 1;
      console.log("cost", cost, user);
      userCost.push(cost);
    }
    costMatrix.push(userCost);
    console.table(userCost);
  }

  if (selectedUsers.length > selectedTasks.length) {
    // padd the things boi
    console.log("num of users less than num of tasks");
    const diff = selectedUsers.length - selectedTasks.length;
    for (let i = 0; i < costMatrix.length; i++) {
      for (let j = 0; j < diff; j++) {
        // dont make this value too big
        costMatrix[i].push(0);
      }
    }
  }
  console.log("costMatrix");
  console.table(costMatrix);
  let result = hungarian(costMatrix);
  console.log("this is the result");
  console.log(result);
  let limit = selectedTasks.length - 1;
  result = removeNumbersAboveLimit(result, limit);
  console.log(result);

  let returnTable = [];

  for (let [usrIdx, usr] of result.entries()) {
    console.log("this is the usr");
    console.log(usr);
    for (let tsk of usr) {
      returnTable.push({
        task: structuredClone(tasks[tsk]),
        user: structuredClone(users[usrIdx]),
      });
    }
  }
  console.log("return table", returnTable);
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
  console.log("these are the tasks of the use");
  console.log(user.user_id);
  console.log(temp);
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
  // console.log("for user", user);
  // console.log("oldestTime is ", oldestTime);
  if (oldestTime > currTime) {
    console.log("assign user", user);
    console.log(oldestTime);
    const resp = await updateUserAttributes({
      userId: user.user_id,
      userBusyUntill: oldestTime,
    });
    console.log("did i assign the user the tiem", resp);
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
    // console.log("usetExp",userExpertise);
  }
  let taskExpertise = "";
  if (task.taskExpertise) {
    taskExpertise = task.taskExpertise.split(",").map((item) => item.trim());
    // console.log("taskExp",taskExpertise);
  }

  const currentExpertiseSet = new Set(taskExpertise);

  //Count the number of remaining expertise values
  let remainingCount = 0;
  for (const expertise of userExpertise) {
    if (!currentExpertiseSet.has(expertise)) {
      remainingCount++;
      // console.log("user doent have expertise", expertise);
    }
  }

  return remainingCount / taskExpertise.length;
}

export default solver;
