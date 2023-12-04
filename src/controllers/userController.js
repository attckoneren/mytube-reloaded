import userModel from "../models/user";
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
  const exists = await userModel.exists({ $or: [{ email }, { name }] });
  if (exists) {
    req.flash("info", "This email or name is already exist");
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
        avatarUrl: userData.avatar_url,
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
  console.log(user);
  return res.render("profile", { pageTitle: user.name, user });
};
