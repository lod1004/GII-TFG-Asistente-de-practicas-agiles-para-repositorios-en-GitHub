const bcrypt = require('bcrypt');
const Counter = require("../models/counter");
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../logger');

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

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: "Nombre de usuario ya existe" });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const newId = await getNextId("userId");

        const newUser = new User({
            id: newId,
            username,
            passwordHash
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
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        console.log(user)
        if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
        logger.info('Sesión iniciada correctamente')
    } catch (error) {
        logger.error('Error en login: ' + error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

const changePassword = async (req, res) => {
    const { username, password, repeatPassword } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const hashedPassword = await bcrypt.hash(repeatPassword, SALT_ROUNDS);
        user.password = hashedPassword;
        await user.save();

        logger.info('Contraseña actualizada correctamente')
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        logger.error('Error al cambiar contraseña: ' + error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword
};
