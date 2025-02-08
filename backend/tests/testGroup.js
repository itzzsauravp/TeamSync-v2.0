import Functions from "./functions.js";
const { initdb, addUser, loginUser, makeGroup, addToGroup, sendMessage, getAllMessage, addColumn, listColumn, addTask } = new Functions();

(async () => {
    let user1 = {
        "email": "ayu",
        "username": "ayu",
        "first_name": "ayu",
        "last_name": "ayu",
        "password": "ayu"
    };
    let user2 = {
        "email": "sau",
        "username": "sau",
        "first_name": "sau",
        "last_name": "sau",
        "password": "sau"
    };
    let user3 = {
        "email": "bin",
        "username": "bin",
        "first_name": "bin",
        "last_name": "bin",
        "password": "bin"
    };
    await initdb();
    await addUser(user2);
    await addUser(user1);
    await addUser(user3);
    let temp = await loginUser(user2);
    let user2Id = temp._body.userId;

    let result1 = await loginUser(user1);
    let token1 = result1._body.token;
    // now logged in as ayu

    let groupConfig1 = {
        groupName: "group Ayu sau",
        token: token1
    }

    let result2 = await makeGroup(groupConfig1, token1)
    // another assert here maybe perhaps
    let groupId1 = result2._body.groupId;

    let groupConfig2 = {
        groupId: groupId1,
        userId: user2Id

    }
    let result3 = await addToGroup(groupConfig2, token1)
    // console.log(result3);

    let message1 = {
        messageContent: "hello this is from ayu account"
    }
    let result4 = await sendMessage(groupId1, message1, token1)
    // console.log(result4);

    let result5 = await getAllMessage(groupId1, token1)
    // console.log(result5._body.messages);

    let result6 = await addColumn(groupId1, "skibityColumn", token1)
    // console.log(result6);
    let columns = await listColumn(groupId1, token1);
    let colId1 = result6._body.data.column_id;

    let result7 = await addTask("task name 1", colId1, token1)
//    console.log(result7);
    console.log(result7._body);
})();