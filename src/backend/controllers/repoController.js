const Repository = require("../models/repo")

const getRepositories = async (req, res) => {
  try {
    const repos = await Repository.find();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los repositorios" });
  }
};

const createRepository = async (req, res) => {
  const { name, owner, commits, issues, closedIssues, createdAt } = req.body;

  try {
    const newRepo = new Repository({ name, owner, commits, issues, closedIssues, createdAt });
    await newRepo.save();
    res.status(201).json(newRepo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el repositorio" });
  }
};

module.exports = { getRepositories, createRepository };
