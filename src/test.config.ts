/**
 * This accounts are used for TRUST&TRACE specific tests. This two users must be signed up on the
 * determined machine and they need to be contacts.
 */
export default {
  tntApi: 'http://localhost:7070',
  user1: {
    emailLogin: {
      email: 'test.trust-trace@test.de',
      password: 'test.trust-trace@test.de',
    }
  },
  user2: {
    emailLogin: {
      email: 'test2.trust-trace@test.de',
      password: 'test2.trust-trace@test.de',
    },
  },
};
