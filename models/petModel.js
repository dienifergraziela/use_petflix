const Database = require('./database');

class Pet {
    constructor(id_animal, nome, genero, porte, localizacao, especie, idade, vacina_obrigatoria, objetivo, descricao, caminho_imagem, user_id_user) {
        this.id_animal = id_animal;
        this.nome = nome;
        this.genero = genero;
        this.porte = porte;
        this.localizacao = localizacao;
        this.especie = especie;
        this.idade = idade;
        this.vacina_obrigatoria = vacina_obrigatoria;
        this.objetivo = objetivo;
        this.descricao = descricao;
        this.caminho_imagem = caminho_imagem;
        this.user_id_user = user_id_user;
    }

    static async listaPet() {
        let pets = await Database.query("SELECT * FROM animal");
        return pets;
    }

    async save(imagePath, userId) {
        console.log("pe id user:" + userId);
        
        let resp = await Database.query(`INSERT INTO animal (nome, genero, porte, localizacao, especie, idade, vacina_obrigatoria, objetivo, descricao, caminho_imagem, user_id_user ) VALUES ('${this.nome}', '${this.genero}', '${this.porte}', '${this.localizacao}' , '${this.especie}', '${this.idade}', '${this.vacina_obrigatoria}','${this.objetivo}', '${this.descricao}', '${imagePath}', '${userId}' );`);
        console.log(resp);
        this.id = resp.insertId;
    }

    static async deletePet(id_animal) {
        const resp = await Database.query(`DELETE FROM animal WHERE id_animal = ${id_animal}`)
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

    static async getById(id, user_id_user) {
        console.log("id model pet: "+id);
        let pet = await Database.query(`SELECT * FROM animal WHERE id_animal = ${id} `);

        console.log("pet para pdf:");
        console.log(pet);
        return pet;
    }


    static async listaPet() {
        let pets = await Database.query("SELECT * FROM animal");
        return pets;
    }

    static async getAnimaisByLocalizacao(localizacao) {
        let pets = await Database.query(`SELECT * FROM animal WHERE localizacao = '${localizacao}'`);
        return pets;
    }


    static async getAnimaisByDono(userId) {
        let pets = await Database.query(`SELECT * FROM animal WHERE user_id_user = '${userId}'`);
        return pets;
    }

    static async update(id, nome, genero, porte, localizacao, especie, idade, vacina_obrigatoria, objetivo, descricao, filename) {
        const resp = await Database.query(`UPDATE animal SET nome = '${nome}', genero = '${genero}', porte = '${porte}', localizacao = '${localizacao}', especie = '${especie}', idade = '${idade}', vacina_obrigatoria = '${vacina_obrigatoria}', objetivo = '${objetivo}', descricao = '${descricao}', caminho_imagem = '${filename}' WHERE id_animal = '${id}'`)
        if (resp) {
            if (resp.affectedRows > 0) {
                return true;
            } else {
                return false;
            }
        } else
            return false;

    }

    static async updateStatus(id, objetivo) {
        const resp = await Database.query(`UPDATE animal SET objetivo = '${objetivo}' WHERE id_animal = '${id}'`)
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

module.exports = Pet