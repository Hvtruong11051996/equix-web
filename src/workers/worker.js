export default () => {
  self.addEventListener("message", e => { // eslint-disable-line
    // eslint-disable-line no-restricted-globals
    if (!e) return;

    const users = [];

    const userDetails = {
      name: 'Jane Doe',
      email: 'jane.doe@gmail.com',
      id: 1
    };

    for (let i = 0; i < 100000000; i++) {
      userDetails.id = i++;
      userDetails.dateJoined = Date.now();

      users.push(userDetails);
    }

    postMessage(users);
  });
};
