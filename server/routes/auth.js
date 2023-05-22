const {
  login,
  register,
  getAllUsers,
  logOut,
  getOfflineUsers
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.get("/logout/:id", logOut);
router.get('/getofflineUsers', getOfflineUsers);

module.exports = router;
