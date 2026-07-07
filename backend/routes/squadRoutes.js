const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const squadController = require("../controllers/squadController");

router.post("/create", auth, squadController.createSquad);
router.get("/my", auth, squadController.getMySquads);
router.get("/:id", auth, squadController.getSquadDetails);
router.put("/:id", auth, squadController.updateSquad);
router.delete("/:id", auth, squadController.deleteSquad);
router.post("/join/:token", auth, squadController.joinSquad);
router.post("/:id/invite/regenerate", auth, squadController.regenerateInvite);

module.exports = router;