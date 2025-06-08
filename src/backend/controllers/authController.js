const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const { validationResult } = require("express-validator");

const User = require('../models/user');
const Counter = require("../models/counter");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

const getNextId = async (sequenceName) => {
    const counter = await Counter.findOneAndUpdate(
        { name: sequenceName },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );
    return counter.value;
};

function validateUser(username) {

    if (typeof username !== "string" || username === "") {
        return res.status(400).json({ message: "Nombre de usuario inválido." });
    }

    const validatedUsername = User.findOne({ username: { $eq: username } });
    return validatedUsername
}

const registerUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const username = req.body.username?.toString().trim();

        const existing = await validateUser(username)
        if (existing) {
            return res.status(409).json({ message: "Nombre de usuario ya existe" });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const newId = await getNextId("userId");

        const newUser = new User({
            id: newId,
            username,
            passwordHash,
            languageCode: 'es'
        });

        await newUser.save();

        logger.info('Usuario registrado correctamente')
        res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (err) {
        console.error("Error en registro:", err);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const username = req.body.username?.toString().trim();

        const user = await validateUser(username)
        if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            languageCode: user.languageCode
        });
        logger.info('Sesión iniciada correctamente')
    } catch (error) {
        logger.error('Error en login: ' + error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const changePassword = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, oldPassword, repeatPassword } = req.body;

    try {
        const username = req.body.username?.toString().trim();

        const user = await validateUser(username)
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const hashedPassword = await bcrypt.hash(repeatPassword, SALT_ROUNDS);
        user.passwordHash = hashedPassword;
        await user.save();

        logger.info('Contraseña actualizada correctamente');
        res.json({ message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        logger.error('Error al cambiar contraseña: ' + error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const changeLanguage = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, languageCode } = req.body;

    try {
        const username = req.body.username?.toString().trim();

        const user = await validateUser(username)
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.languageCode = languageCode;
        await user.save();

        logger.info('Idioma actualizado correctamente');
        res.json({ message: 'Idioma actualizado correctamente' });

    } catch (error) {
        logger.error('Error al cambiar el idioma: ' + error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword,
    changeLanguage
};
