const User = require("../models/userModel");
const Pet = require("../models/petModel");
const validator = require("validator");

let users = [];

async function getUsers(req, res) {
  users = await User.listarUser();
  res.render("perfil", { users });
}

async function getUsers2(req, res) {
  users = await User.listarUser();
  res.render("users", { users });
}

function login(req, res) {
  res.render("login");
}

async function autenticar(req, res) {
  try {
    const resp = await User.autenticar(req.body.email, req.body.senha);

    if (resp && resp.length > 0) {
      req.session.user = resp[0];

      // Verifica se há um parâmetro de redirecionamento na sessão
      const redirectTo = req.session.redirectTo || "/";

      // Limpa o parâmetro de redirecionamento na sessão
      delete req.session.redirectTo;

      res.redirect(redirectTo);
    } else {
      res.locals.erro = "Email ou senha incorretos.";
      res.render("login");
    }
  } catch (error) {
    res.status("Erro durante a autenticação!");
  }
}

let user = {};

async function mostrarPerfil(req, res) {
  let userId;
  if (!req.session.user) {
    userId = "0";
  } else {
    userId = req.session.user.id_user;
  }

  let userId2;
  if (!req.session.user) {
    userId2 = "0";
  } else {
    userId2 = req.session.user.id_user;
  }
  const listaPets = await Pet.getAnimaisByDono(userId);

  const profileLink = `${req.protocol}://${req.get("host")}/${user.nome}/${
    user.id_user
  }`;

  user = await User.findById(userId);

  res.render("perfil", { user, listaPets, userId2, profileLink });
}
async function mostrarPerfilPublico(req, res) {
  try {
    const userId = req.params.id_user;

    let userId2;
    if (!req.session.user) {
      userId2 = "0";
    } else {
      userId2 = req.session.user.id_user;
    }

    // Obtenha as informações do usuário
    const user = await User.findById(userId);

    // Obtenha a lista de animais do dono
    const listaPets = await Pet.getAnimaisByDono(userId);

    // Construa o link do perfil
    const profileLink = `${req.protocol}://${req.get("host")}/perfil/${
      user.nome
    }/${user.id_user}`;

    // Renderize a página do perfil com as informações
    res.render("perfil", { user, listaPets, profileLink, userId2 });
  } catch (error) {
    console.error("Erro ao mostrar o perfil público:", error);
    res.status(500).send("Erro ao mostrar o perfil público");
  }
}

async function getUserById(req, res) {
  const userId = req.session.user.id_user;

  user = await User.findById(userId);
  res.render("editarUser", { user });
}

async function logout(req, res) {
  delete req.session.user;
  res.redirect("/login");
}

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

async function addUser(req, res, imagePath) {
  const { id_user, nome, email, cpf, telefone, senha, imagem, biografia } =
    req.body;

  try {
    const emailExiste = await User.verificarEmail(email);

    if (emailExiste.length > 0) {
      res.locals.emailCad = "Email já cadastrado! Faça login!";
      res.render("cadastro");
    } else {
      const cpfExiste = await User.verificarCpf(cpf);
      if (cpfExiste.length > 0) {
        res.locals.cpfCad = "Cpf já cadastrado!";
        res.render("cadastro");
      } else {
        if (validator.isEmail(email)) {
          if (validarCPF(cpf)) {
            const user = new User(
              id_user,
              nome,
              email,
              cpf,
              telefone,
              senha,
              imagem,
              biografia
            );
            user
              .save(imagePath)
              .then(() => console.log("user cadastrado com sucesso hehe"));
            res.redirect("/login");
          } else {
            res.locals.erro2 = "Cpf inválido!";
            res.render("cadastro");
          }
        } else {
          res.locals.erro = "Email inválido!";
          res.render("cadastro");
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao verificar o email." });
  }
}

async function updateUser(req, res, filename) {
  console.log("Nome do arquivo recebido no controlador:", +filename);

  const { id } = req.params;
  const { nome, email, cpf, telefone, biografia } = req.body;

  // nome, email, cpf, telefone, imagem, biografia
  User.update(id, nome, email, cpf, telefone, filename, biografia, (err) => {
    if (err) {
      console.error("Erro ao atualizar o user:", err);
      return res
        .status(500)
        .send("Erro ao atualizar o user no banco de dados.");
    }
    res.render("editarUser");
  });
  res.redirect("/perfil");
}

module.exports = {
  getUsers,
  login,
  autenticar,
  logout,
  mostrarPerfil,
  addUser,
  updateUser,
  getUserById,
  mostrarPerfilPublico,
  getUsers2,
};
