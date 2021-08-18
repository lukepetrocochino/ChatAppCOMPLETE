const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Checks if the username is already in use
  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  );

  // If it is in use...
  if (existingUser) {
    return { error: "Username is taken" };
  }

  const user = { id, name, room };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  // Checks if there already is a user with their id
  const index = users.findIndex((user) => user.id === id);

  // If there is, remove that user from the users array
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Search for user in users array by ID
const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

// Export the functions
module.exports = { addUser, removeUser, getUser, getUsersInRoom };
