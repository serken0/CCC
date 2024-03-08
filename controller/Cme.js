//model 불러오기
const {
    usersModel,
    jobsModel,
    reviewsModel,
    likesModel,
    stackModel,
} = require("../models");
const dotenv = require("dotenv").config();

// GET /me/jobs
exports.myJobs = async (req, res) => {
    try {
        console.log(req.session.userId);
        if (!req.session.userId)
            return res
                .status(404)
                .send({ isLogin: false, msg: "로그인이 필요합니다." });
        const jobsIdList = await jobsModel.findAll({
            where: { users_id: req.session.userId },
            include: [
                {
                    model: stackModel,
                    attributes: [
                        "react",
                        "vue",
                        "css",
                        "angular",
                        "javascript",
                        "html",
                        "typescript",
                        "sass",
                        "jsx",
                        "webpack",
                    ],
                },
            ],
        });
        console.log(jobsIdList);
        res.send(jobsIdList);
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};