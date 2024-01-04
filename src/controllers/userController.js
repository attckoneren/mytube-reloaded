import userModel from "../models/user";
import videoModel from "../models/video";
import commentModel from "../models/comment";
import bcrypt from "bcrypt";
export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { email, password, password2, name } = req.body;
  if (password !== password2) {
    req.flash("error", "Password confirmation does not match");
    return res.status(400).render("join", {
      pageTitle: "Join",
    });
  }
  const exists = await userModel.exists({ email });
  if (exists) {
    req.flash("error", "This email is already exist");
    return res.status(400).render("join", {
      pageTitle: "Join",
    });
  }
  try {
    await userModel.create({
      email,
      password,
      name,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, socialOnly: false });
  if (!user) {
    req.flash("error", "Email does not exist");
    return res.status(400).render("login", {
      pageTitle: "Login",
    });
  }
  const allGood = await bcrypt.compare(password, user.password);
  if (!allGood) {
    req.flash("error", "Wrong Password");
    return res.status(400).render("login", {
      pageTitle: "Login",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finalGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const apiUrl = "https://api.github.com";
    const { access_token } = tokenRequest;
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await userModel.findOne({ email: emailObj.email });
    if (!user) {
      user = await userModel.create({
        email: emailObj.email,
        socialOnly: true,
        password: "",
        name: userData.name ? userData.name : userData.login,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "edit-profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name },
    file,
  } = req;
  const updateUser = await userModel.findByIdAndUpdate(
    _id,
    {
      name,
      avatarUrl: file ? file.path : avatarUrl,
    },
    { new: true }
  );
  req.session.user = updateUser;

  await commentModel.updateMany(
    { owner: _id },
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
    },
    { new: true }
  );
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Password doesn't exist");
    return res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { currentPassword, newPassword, newPassword2 },
  } = req;
  const user = await userModel.findById(_id);
  const allGood = await bcrypt.compare(currentPassword, user.password);
  if (!allGood) {
    req.flash("error", "Wrong current Password");
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
    });
  }
  if (newPassword !== newPassword2) {
    req.flash("error", "New password does not match");
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
    });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect("/users/logout");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.sendStatus(404);
  }
  const videos = await videoModel.find({ owner: id });
  const formattedDates = await Promise.all(
    videos.map(async (video) => ({
      ...video.toObject(),
      formattedDate: await videoModel.formatDate(video.createdAt),
    }))
  );
  return res.render("profile", {
    pageTitle: user.name,
    user,
    videos: formattedDates,
  });
};

export const subsApi = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;
  let subsCount;
  const user = await userModel.findById(id);
  if (!user) {
    return res.sendStatus(404);
  }
  const sessionUser = await userModel.findById(_id);
  if (!sessionUser) {
    return res.sendStatus(404);
  }
  if (String(user) === String(sessionUser)) {
    return res.sendStatus(404);
  }
  const existingSubs = user.subscriber.includes(_id);
  if (existingSubs) {
    user.subscriber.remove(_id);
    await user.save();
    sessionUser.SubscriptionList.remove(id);
    await sessionUser.save();
    subsCount = user.subscriber.length;
    return res.status(200).json({ subsCount });
  }
  user.subscriber.push(_id);
  await user.save();
  sessionUser.SubscriptionList.push(id);
  await sessionUser.save();
  subsCount = user.subscriber.length;
  const isSubscribed = sessionUser.SubscriptionList.includes(id);
  return res.status(200).json({ subsCount, isSubscribed });
};
