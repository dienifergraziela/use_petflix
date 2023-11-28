require('dotenv').config();

const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const userController = require('./controllers/userController');
const petController = require('./controllers/petController');
const parceiroController = require('./controllers/parceiroController');

require('dotenv').config();
const multer = require('multer');

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.set(express.static(path.join(__dirname, 'views')));

app.use(express.static("uploads"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")))
app.use(express.static(path.join(__dirname, "views/css")))

app.use(session({
    secret: 'rdienigz',
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        if (req.originalUrl === '/cadastrarPet' || req.originalUrl === '/perfil' ) {
            res.redirect('/login');
        } else {
            next();
        }
    } else {
        // Verifica se o usuário é um administrador
        if (req.session.user.role === 'admin') {
            app.set('layout', './layouts/default/index.ejs');
            console.log("adm");
        } else {
            // O usuário é um usuário normal
            app.set('layout', './layouts/default/index.ejs');
        }

        res.locals.layoutVariables = {
            url: process.env.URL,
            img: "/img/",
            style: "/css/",
            title: "Página Inicial",
            user: req.session.user
        };
        next();
    }
});

app.use(expressLayouts);
app.set('layout', './layouts/default/index.ejs');

app.listen(port, () => {
    console.log(`PetFlix rodando em http://localhost:${port}`);
})

app.get('/', (req, res) => {
    res.render('home');
})

app.post('/login', (req, res) => {
    userController.autenticar(req, res);
});

app.get('/login', (req, res) => {
    app.set('layout', './layouts/default/login.ejs');
    userController.login(req, res);
});

app.get('/perfil', userController.mostrarPerfil);

app.get('/pets', petController.getAll);

app.post('/pets/:id_animal/excluir', (req, res) => {
    petController.deletePet(req, res);
});

const Database = require('./models/database');
const { log } = require('console');
const { nextTick } = require('process');

async function verficaDono(req, res, next) {
    const id = req.params.id;
    console.log("CREDO:");
    console.log(id);

    let user_id = await Database.query(`SELECT * FROM animal user_id_user WHERE id_animal = ${id}`);

    const user_id_user = user_id[0].user_id_user;

    console.log("finalmente foi:");
    console.log(user_id_user);

    if (req.session.user.id_user == user_id_user) {
        next();
    }
    else {
        res.send("acesso negado, você não cadastrou esse pet!");
    }
}

app.post('/logout', (req, res) => {
    userController.logout(req, res);
});

app.get('/logout', (req, res) => {
    res.render('login');
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const filePath = file.originalname + Date.now() + path.extname(file.originalname);
        cb(null, filePath);
    }
})
const upload = multer({ storage })

app.post('/cadastrarPet', upload.single("file"), (req, res) => {
    const imageName = req.file.filename;
    console.log("upload realizado com sucesso!");
    console.log(imageName);
    petController.addPet(req, res, imageName);
})

app.post('/pets/:id/editar', verficaDono, upload.single("file"), (req, res) => {
    let imageName = req.file ? req.file.filename : undefined;
    console.log("Nome do arquivo recebido do pet:", imageName);

    // verifica se uma nova imagem foi enviada e, se não, mantenha a imagem atual.
    if (!imageName && req.body.caminho_imagem) {
        imageName = req.body.caminho_imagem;
    }

    petController.updatePet(req, res, imageName);
});

app.get('/pets/:id/editar', verficaDono, petController.getPetById2);

app.get('/cadastrarPet', (req, res) => {
    res.render('cadastrarPet');
});

app.get('/sobre', (req, res) => {
    res.render('sobre');
})

app.get('/conteudos', (req, res) => {
    res.render('conteudos');
})

app.get('/post', (req, res) => {
    res.render('post');
})

app.get('/pets/:id/:user_id_user', petController.getPetById);

app.get('/animais', petController.filtrarAnimais);

function checkAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Acesso negado. Esta função é apenas para administradores.');
    }
};

app.post('/admin/cadastrarParceiro', checkAdmin, upload.single("file"), (req, res) => {
    const imageName = req.file.filename;
    console.log("upload realizado com sucesso!");
    console.log(imageName);
    parceiroController.addParceiro(req, res, imageName);
    console.log("adm ne");
})

app.get('/admin/cadastrarParceiro', checkAdmin, (req, res) => {
    res.render('cadastrarParceiro');
});

app.get('/parceiros', parceiroController.getAll);

app.post('/parceiros/:id_parceiro/excluir', checkAdmin, (req, res) => {
    parceiroController.deleteParceiro(req, res);
});

app.get('/parceiros/:id', parceiroController.getParceiroById);

app.post('/parceiros', parceiroController.filtrarParceiros);
app.get('/parceiros', parceiroController.filtrarParceiros);

app.get('/parceiros/:id/editar', checkAdmin, parceiroController.getParceiroById2);

app.post('/parceiros/:id/editar', checkAdmin, upload.single("file"), (req, res) => {
    let imageName = req.file ? req.file.filename : undefined;

    // Verifica se uma nova imagem foi enviada e, se não, mantenha a imagem atual.
    if (!imageName && req.body.caminho_imagem) {
        imageName = req.body.caminho_imagem;
    }

    parceiroController.updateParceiro(req, res, imageName);
});


//cadastrar user
app.post('/cadastrar', upload.single("file"), (req, res) => {
    const imageName = req.file.filename;
    console.log("upload realizado com sucesso!");
    console.log(imageName);
    userController.addUser(req, res, imageName);
})

app.get('/cadastrar', (req, res) => {
    res.render('cadastro');
})

function perfilMe(req, res, next) {
    const id = req.params.id;

    if (req.session.user.id_user == id) {
        next();
    } else {
        res.send("acesso negado :(");
    }
}

app.post('/perfil/:id/editar', perfilMe, upload.single("file"), (req, res) => {
    let imageName = req.file ? req.file.filename : undefined;
    console.log("Nome do arquivo recebido:", imageName);

    if (!imageName && req.body.imagem) {
        imageName = req.body.imagem;
    }

    userController.updateUser(req, res, imageName);
});

app.get('/perfil/:id/editar', perfilMe, userController.getUserById);

app.post('/pet/:id/atualizar-status', verficaDono, petController.updateStatusPet);

app.get('/perfil/:nome/:id_user', userController.mostrarPerfilPublico);

app.get('/users', userController.getUsers2);

app.get('/generateQRCode', async (req, res) => {
    try {
        const link = req.headers.referer || window.location.href;

        // Gera o QRCode e salva em uma pasta temporária
        const qrCodePath = 'caminho_temporario_qrcode/animal_qrcode.png';
        await QRCode.toFile(qrCodePath, link);

        // Envia o QRCode como resposta para download
        res.download(qrCodePath, 'animal_qrcode.png');
    } catch (error) {
        console.error('Erro ao gerar QRCode:', error);
        res.status(500).send('Erro ao gerar QRCode');
    }
});

app.get('/generatePDF/:id_animal/:user_id_user', async (req, res) => {
    try {
        const id = req.params.id_animal;
        console.log("esse é o id q ta buscando: " + id);

        const user_id_user = req.params.user_id_user;
        const petInfo = await petController.getPetById3(id, user_id_user);

        // Gera o PDF e salva em uma pasta temporária
        const pdfPath = 'caminho_temporario/animal_profile.pdf';
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfPath);

        doc.pipe(stream);

        console.log('petInfo:', petInfo);

        doc.fontSize(16).text('Perfil do Animal', { align: 'center' });
        doc.moveDown();

        if (petInfo.user && petInfo.user.length > 0) {
            const owner = petInfo.user[0];

            doc.fontSize(14).text(`Nome do dono: ${owner.nome}`);
            doc.fontSize(14).text(`Email do dono: ${owner.email}`);
            doc.fontSize(14).text(`Contato do dono: ${owner.telefone}`);
            doc.moveDown();

        } else {
            doc.fontSize(14).text('Erro: Informações do dono indisponíveis.', { color: 'red' });
        }

        if (petInfo.pet && petInfo.pet.length > 0) {
            const owner = petInfo.pet[0];

            // if (owner && owner.caminho_imagem) {
            //     doc.image(owner.caminho_imagem, { width: 200 });
            // } else {
            //     doc.fontSize(14).text('Erro: Caminho da imagem indefinido ou inválido.', { color: 'red' });
            // }

            // doc.fontSize(14).text(`Imagem: ${owner.caminho_imagem}`);
            doc.fontSize(14).text(`Nome : ${owner.nome}`);
            doc.fontSize(14).text(`Objetivo: ${owner.objetivo}`);
            doc.fontSize(14).text(`Localização: ${owner.localizacao}`);
            doc.fontSize(14).text(`Gênero: ${owner.genero}`);
            doc.fontSize(14).text(`Porte: ${owner.porte}`);
            doc.fontSize(14).text(`Espécie: ${owner.especie}`);
            doc.fontSize(14).text(`Idade: ${owner.idade}`);
            doc.fontSize(14).text(`Vacinas Realizadas: ${owner.vacina_obrigatoria}`);
            doc.fontSize(14).text(`Descrição: ${owner.descricao}`);
        } else {
            doc.fontSize(14).text('Erro: Informações do pet indisponíveis.', { color: 'red' });
        }

        doc.end();

        // Espera o término da escrita antes de enviar a resposta
        stream.on('finish', () => {
            stream.end();

            // Envia o PDF como resposta para download
            res.download(pdfPath, 'animal_profile.pdf', (err) => {
                // Exclui o arquivo temporário após o download
                fs.unlink(pdfPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Erro ao excluir arquivo temporário:', unlinkErr);
                    }
                });
            });
        });

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).send('Erro ao gerar PDF');
    }
});