const bcrypt = require('bcryptjs')
const models = require('../database/models')
const jsonwebtoken = require('jsonwebtoken')
require('dotenv').config()

const resolvers = {
    Query: {
        // async getLanguage(_, { code }) {
        //     return models.Language.findOne({ where: { code: code } })
        // },
        // async getAllLanguages(_, args) {
        //     return models.Language.findAll()
        // },
        // async getUser(_, { id }) {
        //     return models.User.findOne({ where: { id: id } });
        // },
        async getMe(_, args, { loggedUser }) {
            if (!loggedUser) throw new Error('You are not authenticated')
            return await models.User.findByPk(loggedUser.id)
        },
        // async getAllUsers(root, args, { user }) {
        //     try {
        //         if (!user) throw new Error('You are not authenticated!')
        //         return models.User.findAll()
        //     } catch (error) {
        //         console.log(error);
        //         throw new Error(error.message)
        //     }
        // },
        async getMyForest(_, args, { loggedUser }) {
            try {
                if (!loggedUser) throw new Error('You are not authenticated!')
                console.log("\n\n**********************************");
                console.log(loggedUser.name);
                console.log("\n\n**********************************");
                const modelo = models.ImportedTree.findAll({ where: { userId: loggedUser.id } })
                // console.log("***MODELO***");
                // console.log(modelo)
                return modelo
            } catch (error) {
                // console.log(error);
                throw new Error(error.message)
            }
        }
    },
    Mutation: {
        // async createLanguage(root, { code, name }) {
        //     return models.Language.create({
        //         code,
        //         name
        //     })
        // },
        // async createUser(_, { name, email, password }) {
        //     return models.User.create({
        //         name,
        //         email,
        //         password: await bcrypt.hash(password, 10)
        //     })
        // },
        async registerUser(_, { name, email, password }) {
            try {
                const user = await models.User.create({
                    name,
                    email,
                    password: await bcrypt.hash(password, 10)
                })
                const token = jsonwebtoken.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1y' }
                )
                return {
                    token, user
                }
            } catch (error) {
                throw new Error(error.message)
            }
        },
        async login(_, { email, password }) {
            try {
                const user = await models.User.findOne({ where: { email } })
                if (!user) {
                    throw new Error('El par email/password no existe.')
                }
                const isValid = await bcrypt.compare(password, user.password)
                if (!isValid) {
                    throw new Error('El par email/password no existe.')
                }
                const token = jsonwebtoken.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                )
                return {
                    token, user
                }
            } catch (error) {
                throw new Error(error.message)
            }
        }
        // async createHobby(root, { studentId, title }) {
        //     return models.Hobby.create({ studentId, title })
        // }
    },
    ImportedTree: {
        async treeId(treeId) {
            // console.log(treeId)
            //console.log(await treeId.getTree())
            return treeId.getTree()
        },
        async userId(userId) {
            return userId.getUser()
        },
    },
    Tree: {
        async owner(userId) {
            //console.log(userId)
            return userId.getUser()
        },
        async sourceLang(languageId) {
            // console.log("****SOURCE******")
            //console.log("****************" + languageId.dataValues.sourceLang)
            return models.Language.findOne({ where: { id: languageId.dataValues.sourceLang } })
        },
        async targetLang(languageId) {
            // console.log("****TARGET******")
            // console.log(d)
            return models.Language.findOne({ where: { id: languageId.dataValues.targetLang } })
        },
    }
    // Hobby: {
    //     async student(student) {
    //         return student.getStudent()
    //     }
    // }
}

module.exports = resolvers;