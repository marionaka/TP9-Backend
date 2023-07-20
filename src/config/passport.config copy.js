import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import userManager from "../dao/dbmanagers/user.manager.js";
import { encryptPassword, comparePassword } from "../utils/encrypt.util.js";
import cartManager from "../dao/dbmanagers/cart.manager.js";
import { appConfig } from "./env.config.js";

const LocalStrategy = local.Strategy;
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, img } = req.body;
        try {
          let user = await userManager.getByEmail(username);
          if (user || username === appConfig.adminName) {
            console.log("El usuario ya existe");
            return done(null, false);
          }
          const encryptedPass = await encryptPassword(password);
          const newUser = await userManager.createUser({
            first_name,
            last_name,
            email,
            age,
            password: encryptedPass,
            img,
          });
          const userCart = await cartManager.addCart();
          newUser.cart = userCart._id;
          await newUser.save();

          return done(null, newUser);
        } catch (err) {
          return done(`Error al registrar el usuario: ${err}`, false);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          if (username === appConfig.adminName && password === appConfig.adminPassword) {
            const adminUser = {
              first_name: "Coder",
              last_name: "House",
              email: username,
              role: "Admin"
            }
            return done(null, adminUser);
          } else {
            const user = await userManager.getByEmail(username);
            if (!user) {
              console.log("El usuario no existe. Regístrese");
              return done(null, false);
            }
            if (!comparePassword(user, password)) {
              console.log("La contraseña no es correcta. Intente nuevamente");
              return done(null, false);
            }
            return done(null, user);
          }
        } catch (err) {
          console.log(`Error de servidor para el login: ${err}`);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: appConfig.githubClient,
        clientSecret: appConfig.githubSecret,
        callbackURL: "http://localhost:8080/api/users/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await userManager.getByEmail(profile._json.email);
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              password: "",
              age: undefined,
              img: profile._json.avatar_url,
            };
            user = await userManager.createUser(newUser);
            done(null, user);
          } else {
            done(null, user);
          }
        } catch (err) {
          done(err, false);
        }
      }
    )
  );

passport.serializeUser((user, done) => {
  if (user.role === "Admin") {
    done(null, user);
  } else {
    done(null, user._id);
  }
});

passport.deserializeUser(async (id, done) => {
  if (typeof id === "object" && id.role === "Admin") {
    done(null, id);
  } else {
    let user = await userManager.getById(id);
    done(null, user);
  }
});
};

export default initializePassport;
