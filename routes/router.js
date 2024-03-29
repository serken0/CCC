const express = require("express");
const router = express.Router();
const mainCtr = require("../controller/Cmain");
const jobsCtr = require("../controller/Cjobs");
const likeCtr = require("../controller/Clike");
const reviewCtr = require("../controller/Creview");
const meCtr = require("../controller/Cme");

/* test */
router.get("/test", mainCtr.test);

/* ========main routing========= */
router.get("/", mainCtr.index);
router.get("/main", mainCtr.main);
router.get("/register", mainCtr.register);
router.post("/register", mainCtr.createUser);
router.get("/login", mainCtr.login);
router.post("/login", mainCtr.findOneUser);
router.get("/mypage", mainCtr.findUserProfile);
router.patch("/mypage", mainCtr.updateUser);
router.delete("/mypage", mainCtr.deleteUser);
router.get("/logout", mainCtr.logout);

/*  ========jobs routing========= */
router.get("/jobs", jobsCtr.jobs);
router.get("/jobs/like", jobsCtr.jobsLike);
router.get("/jobs/:jobId", jobsCtr.jobsDetail);
router.post("/jobs", jobsCtr.jobsWrite);
router.patch("/jobs", jobsCtr.jobsUpdate);
router.delete("/jobs", jobsCtr.jobsDelete);
/*  ========like routing========= 

*/
router.get("/review/:jobsId", reviewCtr.findAllReviews);
router.post("/review", reviewCtr.createReview);
router.patch("/review", reviewCtr.updateReview);
router.delete("/review", reviewCtr.deleteReview);

/*  ========review routing========= 

*/
router.patch("/like", likeCtr.increCount);
router.patch("/unlike", likeCtr.reduceCount);

// ========me routing=========
router.get("/me/jobs", meCtr.myJobs);
// router.get("/me/reviews", meCtr.myReviews);
module.exports = router;
