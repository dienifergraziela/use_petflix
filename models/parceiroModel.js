const Database = require('./database');

class Parceiro {
    constructor(id_parceiro, nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj, caminho_imagem) {
        this.id_parceiro = id_parceiro;
        this.nome = nome;
        this.tipo = tipo;
        this.descricao = descricao;
        this.endereco = endereco;
        this.telefone = telefone;
        this.servico_oferecido = servico_oferecido;
        this.horario_funcionamento = horario_funcionamento;
        this.rede_social = rede_social;
        this.rg = rg;
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.caminho_imagem = caminho_imagem;
    }
    static async listar(callback) {
        let parceiros = await Database.query("SELECT * FROM parceiro");
        return parceiros;
    }

    async save(imagePath) {
        let resp = await Database.query(`INSERT INTO parceiro (nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj, caminho_imagem) VALUES ('${this.nome}', '${this.tipo}', '${this.descricao}', '${this.endereco}' , '${this.telefone}', '${this.servico_oferecido}', '${this.horario_funcionamento}','${this.rede_social}', '${this.rg}', '${this.cpf}', '${this.cnpj}', '${imagePath}' );`);
        console.log(resp);
        this.id = resp.insertId;
    }

    static async deleteParceiro(id_parceiro) {
        const resp = await Database.query(`DELETE FROM parceiro WHERE id_parceiro = ${id_parceiro}`)
        if (resp) {
            if (resp.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    static async getById(id) {
        let parceiro = await Database.query(`SELECT * FROM parceiro WHERE id_parceiro = ${id} `);
        // console.log(parceiro);

        return parceiro;
    }

    static async getParceirosByTipoAndLoc(tipo, endereco) {
        let parceiros = await Database.query(`SELECT * FROM parceiro WHERE tipo = '${tipo}' and endereco = '${endereco}'`);
        return parceiros;
    }

    static async update(id, nome, tipo, descricao, endereco, telefone, servico_oferecido, horario_funcionamento, rede_social, rg, cpf, cnpj, filename) {
                                                                                                                                                                                                                                                                                                                                         
        const resp = await Database.query(`UPDATE parceiro SET nome = '${nome}', tipo = '${tipo}', descricao = '${descricao}', endereco = '${endereco}', telefone = '${telefone}', servico_oferecido = '${servico_oferecido}', horario_funcionamento = '${horario_funcionamento}', rede_social = '${rede_social}', rg = '${rg}', cpf = '${cpf}', cnpj = '${cnpj}', caminho_imagem = '${filename}' WHERE id_parceiro = '${id}'`)
        if (resp) {
            if (resp.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } else
            return false;

    }

}

module.exports = Parceiro;