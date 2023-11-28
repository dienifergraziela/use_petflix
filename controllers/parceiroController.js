const Parceiro = require('../models/parceiroModel');

let listaParceiros = {};

async function getAll(req, res) {
    try {
        listaParceiros = await Parceiro.listar();

        // console.log(listaParceiros);

        res.render('parceiros', { user: req.session.user, listaParceiros });
    } catch (error) {
        console.log(error);
    }
}

async function addParceiro(req, res, imagePath) {
    const { id_parceiro, nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj, caminho_imagem } = req.body;
    const pet = new Parceiro(id_parceiro, nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj, caminho_imagem);
    pet.save(imagePath).then(() => console.log("parceiro cadastrado com sucesso!"));
    res.redirect('/');
}

async function deleteParceiro(req, res) {
    if (await Parceiro.deleteParceiro(req.params.id_parceiro)) {
        res.redirect('/parceiros');
    } else {
        res.redirect('/parceiros');
    }
}
let parceiro = {};

async function getParceiroById(req, res) {
    const { id } = req.params;
    parceiro = await Parceiro.getById(id);

    if(!req.session.user){
        req.session.user = "0";
      }else{
        userId = req.session.user.id_user;
      }
    res.render('parceiro', { user: req.session.user, parceiro: parceiro });
}

async function filtrarParceiros(req, res) {
    const { tipo, endereco } = req.body; 

    listaParceiros = await Parceiro.getParceirosByTipoAndLoc(tipo, endereco);

    res.render('parceirosTipo', { parceiros: listaParceiros });
};

async function getParceiroById2(req, res) {
    const { id } = req.params;
    parceiro = await Parceiro.getById(id);

    res.render('editarParceiro', { parceiro: parceiro });
}

async function updateParceiro(req, res) {
    const { id } = req.params;
    const { nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj } = req.body;

    Parceiro.update(id, nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj, (err) => {
        if (err) {
            console.error('Erro ao atualizar o parceiro:', err);
            return res.status(500).send('Erro ao atualizar o parceiro no banco de dados.');
        }
        res.render('editarParceiro')
    });
    res.redirect('/parceiros');

}

module.exports = { getAll, addParceiro, deleteParceiro, getParceiroById, filtrarParceiros, updateParceiro, getParceiroById2 }