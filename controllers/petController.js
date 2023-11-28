const Pet = require("../models/petModel");
const User = require("../models/userModel");
const userController = require("./userController");

let listaPets = {};
async function getAll(req, res) {
  try {
    listaPets = await Pet.listaPet();
    // console.log(listaPets);
    res.render("pets", { user: req.session.user, listaPets });
  } catch (error) {
    console.log(error);
  }
}

let user = {};
async function addPet(req, res, imagePath) {
  const userId = req.session.user.id_user;

  user = await User.findById(userId);

  const {
    id_animal,
    nome,
    genero,
    porte,
    localizacao,
    especie,
    idade,
    vacina_obrigatoria,
    objetivo,
    descricao,
    caminho_imagem,
    user_id_user,
  } = req.body;
  const pet = new Pet(
    id_animal,
    nome,
    genero,
    porte,
    localizacao,
    especie,
    idade,
    vacina_obrigatoria,
    objetivo,
    descricao,
    caminho_imagem,
    user_id_user
  );

  pet
    .save(imagePath, userId)
    .then(() => console.log("pet cadastrado com sucesso!"));

  res.redirect("/");
}

async function deletePet(req, res) {
  if (await Pet.deletePet(req.params.id_animal)) {
    res.redirect("/pets");
  } else {
    res.redirect("/pets");
  }
}

let pet = {};
async function getPetById(req, res) {
  const id = req.params.id;
  pet = await Pet.getById(id);

  const user_id_user = req.params.user_id_user;
  user = await User.userDono(user_id_user);

  let userId;
  
  if(!req.session.user){
    userId = "0";
  }else{
    userId = req.session.user.id_user;
  }

  res.render("pet", { user: user, pet: pet, userId });
}

async function getPetById3(id, user_id_user) {
  try {
      // Certifique-se de que a função getById retorna um objeto com a propriedade 'id'
      const pet = await Pet.getById(id);

      // Certifique-se de que a função userDono retorna um objeto com a propriedade 'id_user'
      const user = await User.userDono(user_id_user);

      // Certifique-se de que o objeto 'pet' não é indefinido antes de acessar a propriedade 'id'
      // if (!pet || !pet.id) {
      //     // Modificado: Retorna um objeto vazio se o pet não for encontrado
      //     return { pet: {}, user };
      // }

      return { pet, user };
  } catch (error) {
      console.error('Erro ao obter informações do pet:', error);
      throw error; // Certifique-se de tratar o erro adequado na chamada da função
  }
}

async function filtrarAnimais(req, res) {
  const localizacao = req.body.localizacao;

  listaPets = await Pet.getAnimaisByLocalizacao(localizacao);

  res.render("petsLocal", { pets: listaPets });
}

async function getPetById2(req, res) {
  const { id } = req.params;
  pet = await Pet.getById(id);

  res.render("editarPet", { pet: pet });
}

async function updatePet(req, res, filename) {
  const { id } = req.params;
  const {
    nome,
    genero,
    porte,
    localizacao,
    especie,
    idade,
    vacina_obrigatoria,
    objetivo,
    descricao,
    caminho_imagem

  } = req.body;

  Pet.update(
    id,
    nome,
    genero,
    porte,
    localizacao,
    especie,
    idade,
    vacina_obrigatoria,
    objetivo,
    descricao,
    filename,
    (err) => {
      if (err) {
        console.error("Erro ao atualizar o pet:", err);
        return res
          .status(500)
          .send("Erro ao atualizar o pet no banco de dados.");
      }
      res.render("editarPet");
    }
  );
  res.redirect("/pets");
}

async function updateStatusPet(req, res) {
  const { id } = req.params;
  const { objetivo } = req.body;

  Pet.updateStatus(id, objetivo, (err) => {
    if (err) {
      console.error("Erro ao atualizar o status do pet:", err);
      return res
        .status(500)
        .send("Erro ao atualizar o status do pet no banco de dados.");
    }
    res.render("pet");
  });
  res.redirect("/pets");
}

module.exports = {
  getAll,
  addPet,
  deletePet,
  updatePet,
  getPetById,
  filtrarAnimais,
  getPetById2,
  updateStatusPet,
  getPetById3
};