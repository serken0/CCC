//model 불러오기
const {
    usersModel,
    jobsModel,
    reviewsModel,
    likesModel,
    stackModel,
} = require("../models");
const dotenv = require("dotenv").config();
const axios = require("axios");

exports.index = async (req, res) => {
    if (req.session.userId) {
        res.render("index", {
            isLogin: true,
            nickname: req.session.nickname,
            userId: req.session.userId,
        });
    } else {
        res.render("index", { isLogin: false });
    }
};
// 테스트용
exports.test = (req, res) => {
    if (req.session.userId) {
        res.render("getDB", {
            isLogin: true,
            nickname: req.session.nickname,
            userId: req.session.userId,
        });
    } else {
        res.render("getDB", { isLogin: false });
    }
};

// get /main
// 전체 공고 목록 조회
exports.main = async (req, res) => {
    const foundJobs = await jobsModel.findAll({
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
        order: [["created_at", "DESC"]], // createdAt을 기준으로 내림차순 정렬
    });
    res.send(foundJobs);
};

// get /login
// 회원가입페이지 렌더링
exports.register = (req, res) => {
    res.send("register page");
};

// post /register
// 회원가입 포스트 요청
// 회원가입 페이지에서 가입하기 버튼 클릭시
exports.createUser = async (req, res) => {
    try {
        const { email, password, nickname } = req.body;
        // 이메일 중복 체크 검사
        const checkDup = await usersModel.findOne({
            where: {
                users_email: email,
            },
        });
        if (checkDup) return res.send({ result: false, msg: "이메일 중복" });
        // email, password,nickname 값중하나라도 안들어온 경우 예외처리
        if (!email || !password || !nickname) {
            return res
                .status(404)
                .send({ result: false, msg: "입력 값을 모두 작성해주세요" });
        }
        // 유저정보 디비 삽입
        const newUser = await usersModel.create({
            users_email: email,
            users_password: password,
            nickname: nickname,
        });
        //todo:
        //비밀번호 암호화

        if (newUser) {
            // 디비 삽입 성공시 세션 설정
            req.session.userId = newUser.users_id;
            req.session.nickname = newUser.nickname;
            res.send({ result: true, msg: "회원가입 성공" }); // 회원 가입 성공
        } else {
            // 회원 가입 실패
            res.send({ result: false, msg: "회원가입 실패" });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};

// get /login
// 로그인 페이지 렌더링
exports.login = (req, res) => {
    res.send("login page");
};

// post /login
// 로그인 요청시 DB 조회
// 회원가입 창에서 로그인 버튼 눌렀을때
exports.findOneUser = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;
        // email, password 값중하나라도 안들어온 경우 예외처리
        if (!email || !password) {
            return res
                .status(404)
                .send({ result: false, msg: "입력 값을 모두 작성해주세요" });
        }
        const foundUser = await usersModel.findOne({
            where: {
                users_email: email,
                users_password: password,
            },
        });

        // 가입된 유저시 세션 설정
        if (foundUser) {
            req.session.userId = foundUser.users_id;
            req.session.nickname = foundUser.nickname;
            res.send({
                result: true,
                msg: "로그인 성공",
                userId: foundUser.users_id,
                nickname: foundUser.nickname,
            }); // 로그인 성공
        } else {
            // 로그인 실패
            res.send({ result: false, msg: "로그인 실패" });
        }
        //비밀번호 암호화
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};

// get /mypage
// 세션에 userId 값이 있을 때(로그인 상태) 사용자 정보 표시
exports.findUserProfile = async (req, res) => {
    if (!req.session.userId)
        return res
            .status(404)
            .send({ result: false, msg: "로그인이 필요합니다" });
    try {
        //세션값으로 유저 프로필 조회
        const userProfile = await usersModel.findOne({
            where: {
                users_id: req.session.userId,
            },
        });

        if (userProfile) {
            res.send({
                result: true,
                data: userProfile,
                msg: "회원 정보 조회 완료",
            });
        } else {
            res.send({
                result: false,
                msg: "로그인이 필요합니다",
            });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};
// patch /myapge
// 사용자 정보 수정
exports.updateUser = async (req, res) => {
    if (!req.session.userId)
        return res
            .status(404)
            .send({ result: false, msg: "로그인이 필요합니다" });
    try {
        const { password, nickname } = req.body;

        const isUpdated = await usersModel.update(
            {
                users_password: password,
                nickname: nickname,
            },
            {
                where: {
                    // users_id: userId
                    users_id: req.session.userId,
                },
            }
        );

        if (isUpdated > 0) {
            // 수정 성공시
            res.send({ result: true, msg: "수정 완료" });
        } else {
            res.send({ result: false, msg: "수정된 정보가 없습니다." });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};

// delete /mypage
// 사용자 정보 수정
exports.deleteUser = async (req, res) => {
    if (!req.session.userId)
        return res
            .status(404)
            .send({ result: false, msg: "로그인이 필요합니다" });
    try {
        const isDeleted = await usersModel.destroy({
            where: {
                // users_id: 2,
                users_id: req.session.userId,
            },
        });

        if (isDeleted > 0) {
            // 삭제 성공시 세션 삭제
            req.session.destroy((err) => {
                if (err) throw err;
            });
            res.send({ result: true, msg: "회원 탈퇴 완료" });
            //res.redirect("/");
        } else {
            res.send({ result: false, msg: "회원 탈퇴 실패" });
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};
// get /logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
    });
    res.send({ result: true, msg: "로그아웃 완료" });
};

// =================== oAuth ===================
// get /goole/test
// 구글 로그인 테스트 페이지
exports.googleTest = (req, res) => {
    res.render("gLogin");
};
// get /google/login
// 프론트에서 링크걸 경로 href="/google/login"
// 구글 로그인 경로
exports.googleLogin = (req, res) => {
    let url = "https://accounts.google.com/o/oauth2/v2/auth";
    url += `?client_id=${process.env.GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${process.env.GOOGLE_LOGIN_REDIRECT_URI}`;
    url += "&response_type=code";
    url += "&scope=email profile";

    res.redirect(url);
};
// get /google/login
// 구글 로그인 후 디비에 등록된 사용자인지 검증
exports.googleLoginRedirect = async (req, res) => {
    const { code } = req.query;

    const resp = await axios.post(process.env.GOOGLE_TOKEN_URL, {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI,
        grant_type: "authorization_code",
    });

    const resp2 = await axios.get(process.env.GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${resp.data.access_token}`,
        },
    });
    // res.json(resp2.data); 결과 표시
    // 받아온 정보로 디비 조회
    try {
        const { email } = resp2.data; // 구글 서버에서 온 정보로 교체

        const foundUser = await usersModel.findOne({
            where: {
                users_email: email,
            },
        });

        // 가입된 유저시 세션 설정
        if (foundUser) {
            req.session.userId = foundUser.users_id;
            req.session.nickname = foundUser.nickname;
            res.send(`<script>
            localStorage.setItem("userId", "${foundUser.users_id}");
            localStorage.setItem("nickname", "${foundUser.nickname}");
            localStorage.setItem("isLoggedIn", "true");
            alert("로그인 성공");
            window.location.href="/";
            </script>`);
            //     {
            //     result: true,
            //     msg: "로그인 성공",
            //     userId: foundUser.users_id,
            //     nickname: foundUser.nickname,
            // } // 로그인 성공
        } else {
            // 로그인 실패
            res.send(`<script>
            alert("로그인 실패, 회원 가입 후 이용하세요")
            window.location.href="/"
            </script>`);
        }
        //todo:

        //비밀번호 암호화
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};
// get /google/signup
// 구글 회원가입 경로
exports.googleSignUp = (req, res) => {
    let url = "https://accounts.google.com/o/oauth2/v2/auth";
    url += `?client_id=${process.env.GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${process.env.GOOGLE_SIGNUP_REDIRECT_URI}`;
    url += "&response_type=code";
    url += "&scope=email profile";
    res.redirect(url);
};
// get /google/signup
//
exports.googleSignUpRedirect = async (req, res) => {
    const { code } = req.query;

    const resp = await axios.post(process.env.GOOGLE_TOKEN_URL, {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_SIGNUP_REDIRECT_URI,
        grant_type: "authorization_code",
    });

    const resp2 = await axios.get(process.env.GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${resp.data.access_token}`,
        },
    });
    // res.json(resp2.data);
    try {
        const { email, name } = resp2.data;
        //이메일 중복체크 검사
        const checkDup = await usersModel.findOne({
            where: {
                users_email: email,
            },
        });
        if (checkDup)
            return res.send(`<script>alert("이미 가압된 이메일 입니다.")
        window.location.href="/"
        </script>`);
        //검증 후 데이터 생성
        const newUser = await usersModel.create({
            users_email: email,
            users_password: "google login User",
            nickname: name,
        });

        if (newUser) {
            // 디비 삽입 성공시 세션 설정
            req.session.userId = newUser.users_id;
            req.session.nickname = newUser.nickname;
            res.send(`<script>alert("회원 가입 성공")
            window.location.href="/"
            </script>`); // 회원 가입 성공
        } else {
            // 회원 가입 실패
            res.send(`<script>alert("회원 가입 실패")
            window.location.href="/"
            </script>`);
        }
    } catch (error) {
        console.log("error", error);
        res.status(500).send("server error");
    }
};
