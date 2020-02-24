const express = require("express");

const router = express.Router();

router.post("/chiffrer/", async (req, res) => {
  // View logged in admin profile
  // req.params.path;
  // console.time("chiffrement");
  // const key = key_helper.getKey("./G4C.txt");
  // CompressFile(answers_2.path, key);
  res.redirect("/");
});
module.exports = router;
